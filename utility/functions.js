const nodemailer = require("nodemailer");
const Web3 = require("web3");
const User = require("../module/user/model/userTable");
require("dotenv").config();
// const tokenAbi = require("../../../config/tokenAbi.json")

const keystoreJsonV3 = require("../config/constants.json");
const web3 = new Web3(
  new Web3(`https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_RPC_KEY}`)
);

const {
  Currency,
  generateAddressFromXPub,
  generateWallet,
  generatePrivateKeyFromMnemonic,
} = require("@tatumio/tatum");
const axios = require("axios");

const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let userAuthentication = async function(req, res, next) {
  const token = req.get("token");
  if (!token) {
    return res.status(500).send({
      status: "failure",
      status_code: 500,
      message: "Authentication Required!",
      data: {},
    });
  }
  let userExist = await User.findOne({ token: token });
  if (!userExist) {
    return res.status(500).send({
      status: "failure",
      status_code: 500,
      message: "Authentication Failed!",
      data: {},
    });
  }
  req.decode = userExist;
  next();
};

let sendErrorResponse = function(err, res) {
  return res.status(err.status_code || 500).send({
    status: "failure",
    status_code: err.status_code || 500,
    message: err.message,
    error_description: err.error_description || "",
    data: err.data || {},
  });
};

let sendSuccessResponse = function(result, res, other) {
  let totalcount = result.count ? result.count : "";
  let sendData = {
    status: "success",
    status_code: result.status_code || 200,
    message: result.message || "SUCCESS!",
    data: result.data || {},
    ...totalcount,
  };
  sendData = { ...sendData, ...other };
  return res.status(result.status_code || 200).send(sendData);
};
let validationData = function(reqData, validateData) {
  let validationResppnse = {
    error: "",
    status: false,
  };
  for (let i = 0; i < validateData.length; i++) {
    if (
      !reqData[`${validateData[i]}`] ||
      reqData[`${validateData[i]}`] == "" ||
      reqData[`${validateData[i]}`] == null
    ) {
      validationResppnse.error = `${validateData[i]} is Required!`;
      validationResppnse.status = true;
      break;
    }
  }
  return validationResppnse;
};
let createMsg = async function(req) {
  var OTP = (Math.floor(Math.random() * 1000000) + 1000000)
    .toString()
    .substring(1);
  console.log(OTP);
  const number = req.body.phoneNumber;
  const data = await client.messages.create({
    body: `Centralize Exchange Phone Number Verification OTP Is ${OTP}`,
    otp: OTP.toString(),
    from: "+1434597-3575",
    to: `+91${number}`,
  });
  return data;
};

let createEmail = async function(req) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_GMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });
  var OTP = (Math.floor(Math.random() * 1000000) + 1000000)
    .toString()
    .substring(1);
  console.log(OTP);
  const email = req.body.email;
  transporter.sendMail({
    from: '"Centralized Exchange"<testthoughtwin@gmail.com>',
    to: `${email}`,
    subject: `Verify your email address`,
    text: `Centralize Exchange Phone Number Verification OTP Is ${OTP}`,
  });
  return (data = {
    OTP: OTP,
  });
};
let sendSuccessResponseWithCount = function(result, count, res, other) {
  let sendData = {
    ...result,
    status: "success",
    status_code: result.status_code || 200,
    message: result.message || "SUCCESS!",
    data: result.data || {},
    totalCount: count,
  };
  sendData = { ...sendData, ...other };
  return res.status(result.status_code || 200).send(sendData);
};

const GenrateWallet = async function() {
  const ethWallet = await generateWallet(Currency.ETH, false);
  console.log(ethWallet);
};

const GenratePrivateKey = async function() {
  try {
    const wId = await GenerateID();

    console.log(
      "🚀 ~ file: functions.js:162 ~ GenratePrivateKey ~ process.env.MNEMONIC:",
      process.env.MNEMONIC
    );

    const resultData = await generatePrivateKeyFromMnemonic(
      Currency.ETH,
      false,
      process.env.MNEMONIC,
      wId
    );
    console.log(
      "🚀 ~ file: functions.js:162 ~ GenratePrivateKey ~ resultData:",
      resultData
    );

    const publicAddress = await GenratePublicKey(wId);
    console.log(
      "🚀 ~ file: functions.js:155 ~ GenratePrivateKey ~ publicAddress:",
      publicAddress
    );

    return { publicAddress, wId };
  } catch (error) {
    console.log(error.message);
  }
};

const GenratePublicKey = async function(ids) {
  try {
    const ethAddress = await generateAddressFromXPub(
      Currency.ETH,
      false,
      process.env.XPUB || "GenratePubKe",
      ids
    );

    return ethAddress;
  } catch (error) {
    console.log(error);
  }
};

const GenerateID = async function() {
  console.log("🚀 ~ file: functions.js:178 ~ GenerateID ~ wId:wId");

  const wId = Web3.utils.toHex(Math.floor(Date.now() / 1000));
  console.log("🚀 ~ file: functions.js:178 ~ GenerateID ~ wId:", wId);

  return wId;
};

const HotWalletAccess = async function() {
  let object = await web3.eth.accounts.decrypt(keystoreJsonV3, "ACCESS_KEY");
  return object;
};

const TransferFundsFromHotWallet = async function(toAddress, amount) {
  let object = await HotWalletAccess();
  //  let account = await web3.eth.accounts.add(object.privateKey)

  console.log(object);

  await web3.eth.getBalance(object.address).then(console.log);

  let data = await web3.eth.accounts.signTransaction(
    {
      to: toAddress,
      value: web3.utils.toWei(amount, "ether"),
      gas: 21000,
    },
    object.privateKey
  );

  console.log(data.rawTransaction, "transaction");

  const hash = web3.eth
    .sendSignedTransaction(data.rawTransaction)
    .on("receipt", console.log);

  return { hash: hash };
};

const TransferFundsToHotWallet = async function(
  toAddress,
  fromAddress,
  amount,
  wId
) {
  // let wId = await getUser(cryptoaccount=fromAddress).wId

  const object = await GenratePrivateKey(wId);

  const data = await web3.eth.accounts.signTransaction(
    {
      to: toAddress,
      value: web3.utils.toWei(amount, "ether"),
      gas: 21000,
    },
    object.privateKey
  );

  console.log(data.rawTransaction, "transaction");

  web3.eth
    .sendSignedTransaction(data.rawTransaction)
    .on("receipt", console.log);
  await web3.eth.getBalance(object.address).then(console.log);
};

const getUserByPublicAddress = async function(cryptoAddress) {
  try {
    const user = await User.findOne({ cryptoAddress: cryptoAddress });
    const userBalance = await User.getBalance(user.address);
    return userBalance;
    // console.log(user);
  } catch (error) {}
};

const getBalance = async function(address) {
  const balance = await web3.eth.getBalance(address);
  console.log(balance);
  return balance;
};

let getPrice = async function (fromCurrency,toCurrency){
  const price = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${fromCurrency}&vs_currencies=${toCurrency}`)
  if(price){
    return price.data
  }
  return false;
  
}

module.exports = {
  userAuthentication,
  sendErrorResponse,
  validationData,
  createMsg,
  createEmail,
  sendSuccessResponseWithCount,
  sendSuccessResponse,
  GenrateWallet,
  GenratePublicKey,
  GenratePrivateKey,
  HotWalletAccess,
  TransferFundsFromHotWallet,
  TransferFundsToHotWallet,
  getUserByPublicAddress,
  getBalance,
  getPrice,
};
