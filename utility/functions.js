require("dotenv").config();
const nodemailer = require("nodemailer");
const User = require("../module/user/model/userTable");
const {
  Currency,
  generateAddressFromXPub,
  generateWallet,
  generatePrivateKeyFromMnemonic,
} = require("@tatumio/tatum");
const Web3 = require("web3");

const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let userAuthentication = async (req, res, next) => {
  let token = req.get("token");
  if (!token) {
    return res.status(500).send({
      status: "failure",
      status_code: 500,
      message: "User Authentication Required",
      data: {},
    });
  }

  const userExists = await User.findOne({ token: token });
  console.log("🚀 ~ file: functions.js:29 ~ userAuthentication ~ userExists:", userExists)
  if (!userExists) {
    console.log("🚀 ~ file: functions.js:31 ~ userAuthentication ~ userExists:", userExists)
    return res.status(500).send({
      status: "failure",
      status_code: 500,
      message: "User Authentication Failed  ",
      data: {},
    });
  }

  req.decode = userExists;

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

let GenrateWallet = async function() {
  const ethWallet = await generateWallet(Currency.ETH, false);
  console.log(ethWallet);
};

let GenratePrivateKey = async function() {
  try {
    const wId = await GenerateID();

    await generatePrivateKeyFromMnemonic(
      Currency.ETH,
      false,
      process.env.MNEMONIC,
      wId
    );

    const publicAddress = await GenratePublicKey(wId);
    return { publicAddress, wId };
  } catch (error) {
    console.log(error.message);
  }
};

let GenratePublicKey = async function(ids) {
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

let GenerateID = async function() {
  const wId = Web3.utils.toHex(Math.floor(Date.now() / 1000));
  return wId;
};

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
};
