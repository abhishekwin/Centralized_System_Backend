const User = require("../../user/model/userTable");
const utilityFunc = require("../../../utility/functions");
var jwt = require("jsonwebtoken");
const env = require("../../../config/env");
const bcrypt = require("bcrypt");
const axios = require("axios");

module.exports = {
  register: async (req, res) => {
    try {
      let data = req.body;
      utilityFunc.sendSuccessResponse({}, res);
    } catch (error) {
      console.log("error ==> ", error);
      utilityFunc.sendErrorResponse(error, res);
    }
  },
  createAccount: async (req, res) => {
    try {
      let data = req.body;

      let validationData = await utilityFunc.validationData(req.body, [
        "password",
      ]);
      if (validationData && validationData.status) {
        return utilityFunc.sendErrorResponse(validationData.error, res);
      }
      if (!data.email && !data.phoneNumber) {
        return utilityFunc.sendErrorResponse(
          "Email Or Phone Number Is Required!",
          res
        );
      }

      //Generate Crypto Address Here

      const walletdata = await utilityFunc.GenratePrivateKey();
      console.log(walletdata);
      console.log(walletdata.publicAddress, walletdata.wId, "generated");

      if (data.phoneNumber) {
        userExist = await User.findOne({ phoneNumber: data.phoneNumber });
        if (userExist) {
          return utilityFunc.sendSuccessResponse(
            { login: false, exist: true, password: true, user: userExist },
            res
          );
        } else {
          let OTPData = await utilityFunc.createMsg(req);
          if (OTPData && OTPData.body) {
            var numb = OTPData.body.match(/\d/g);
            numb = numb.join("");

            let token = await jwt.sign(
              {
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                data: data.phoneNumber,
              },
              env.JWT_SECRET
            );

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.password, salt);

            let userNew = await User.create({
              phoneNumber: data.phoneNumber,
              password: hashedPassword,
              OTP: numb,
              token: token,
              wId: walletdata.wId,
              cryptoAddress: walletdata.publicAddress,
            });

            return utilityFunc.sendSuccessResponse(
              {
                login: true,
                exist: true,
                password: true,
                otp: false,
                user: userNew,
              },
              res
            );
          }
        }
      }
      if (data.email) {
        userExist = await User.findOne({ email: data.email });
        if (userExist) {
          return utilityFunc.sendSuccessResponse(
            { login: false, exist: true, password: true, user: userExist },
            res
          );
        } else {
          let OTPData = await utilityFunc.createEmail(req);
          if (OTPData && OTPData.OTP) {
            let token = await jwt.sign(
              {
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                data: data.email,
              },
              env.JWT_SECRET
            );
            // Hash Password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.password, salt);
            console.log(
              "🚀 ~ file: user.js:56 ~ createAccount: ~ hashedPassword:",
              hashedPassword
            );

            let userNew = await User.create({
              email: data.email,
              password: hashedPassword,
              OTP: OTPData.OTP,
              token: token,
              wId: walletdata.wId,
              cryptoAddress: walletdata.publicAddress,
            });
            return utilityFunc.sendSuccessResponse(
              {
                login: true,
                exist: true,
                password: true,
                otp: false,
                user: userNew,
              },
              res
            );
          }
        }
      }
    } catch (error) {
      console.log("error ==> ", error);
      utilityFunc.sendErrorResponse(error, res);
    }
  },
  verifyAccount: async (req, res) => {
    let data = req.body;
    if (
      !data.email &&
      !data.googleId &&
      !data.facebookId &&
      !data.phoneNumber
    ) {
      return utilityFunc.sendErrorResponse("Fields Is Required!", res);
    }
    req.body.criptoAddress = "";
    let userExist = null;
    if ((data.googleId && data.email) || (data.facebookId && data.email)) {
      userExist = await User.findOne({
        $or: [
          { googleId: data.googleId },
          { email: data.email },
          { facebookId: data.facebookId },
        ],
      });
      if (userExist) {
        let token = await jwt.sign(
          {
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            data: userExist.email,
          },
          process.env.JWT_SECRET
        );
        await User.findOneAndUpdate(
          { _id: userExist._id },
          { $set: { token: token } }
        );
        return utilityFunc.sendSuccessResponse(
          {
            message: "Login Success",
            login: true,
            exist: true,
            token: token,
            user: userExist,
          },
          res
        );
      } else {
        let token = await jwt.sign(
          { exp: Math.floor(Date.now() / 1000) + 60 * 60, data: data.email },
          process.env.JWT_SECRET
        );
        // add Cripto data

        let newUser = await User.create({
          googleId: data.googleId || "",
          facebookId: data.facebookId || "",
          token: token,
          email: data.email,
        });
        return utilityFunc.sendSuccessResponse(
          {
            message: "Login Success",
            login: true,
            exist: true,
            token: token,
            user: newUser,
          },
          res
        );
      }
    }
    if (data.phoneNumber) {
      userExist = await User.findOne({ phoneNumber: data.phoneNumber });
      if (userExist) {
        return utilityFunc.sendSuccessResponse(
          { login: false, exist: true, password: true, user: userExist },
          res
        );
      } else {
        return utilityFunc.sendSuccessResponse(
          { login: false, exist: false, password: true },
          res
        );
      }
    }
    if (data.email && !data.googleId && !data.facebookId) {
      userExist = await User.findOne({ email: data.email });
      if (userExist) {
        return utilityFunc.sendSuccessResponse(
          { login: false, exist: true, password: true, user: userExist },
          res
        );
      } else {
        return utilityFunc.sendSuccessResponse(
          { login: false, exist: false, password: true },
          res
        );
      }
    }
  },

  verifyOTP: async (req, res) => {
    try {
      let data = req.body;
      let validationData = await utilityFunc.validationData(req.body, ["OTP"]);
      if (validationData && validationData.status) {
        return utilityFunc.sendErrorResponse(validationData.error, res);
      }
      if (!data.email && !data.phoneNumber) {
        return utilityFunc.sendErrorResponse(
          "Email Or Phone Number Is Required!",
          res
        );
      }
      if (data.email) {
        let userFound = await User.findOne({ email: data.email });
        if (!userFound) {
          return utilityFunc.sendErrorResponse("Invalid Email!", res);
        }
        if (userFound && userFound.OTP != data.OTP) {
          return utilityFunc.sendErrorResponse("OTP not Matched!", res);
        } else {
          await User.findOneAndUpdate(
            { _id: userFound._id },
            { $set: { isEmailVerified: true } }
          );
          return utilityFunc.sendSuccessResponse(
            {
              message: "Login Success",
              login: true,
              exist: true,
              token: userFound.token,
              user: userFound,
            },
            res
          );
        }
      }
      if (data.phoneNumber) {
        let userFound = await User.findOne({ phoneNumber: data.phoneNumber });
        if (!userFound) {
          return utilityFunc.sendErrorResponse("Invalid Phone Number!", res);
        }
        if (userFound && userFound.OTP != data.OTP) {
          return utilityFunc.sendErrorResponse("OTP not Matched!", res);
        } else {
          await User.findOneAndUpdate(
            { _id: userFound._id },
            { $set: { isPhoneVerified: true } }
          );
          return utilityFunc.sendSuccessResponse(
            {
              message: "Login Success",
              login: true,
              exist: true,
              token: userFound.token,
              user: userFound,
            },
            res
          );
        }
      }
    } catch (error) {
      console.log("error ==> ", error);
      utilityFunc.sendErrorResponse(error, res);
    }
  },

  login: async (req, res) => {
    try {
      let data = req.body; // Get The Data from the Request
      let validationData = await utilityFunc.validationData(req.body, [
        "password",
      ]);
      if (validationData && validationData.status) {
        return utilityFunc.sendErrorResponse(validationData.error, res);
      }
      if (!data.email && !data.phoneNumber) {
        return utilityFunc.sendErrorResponse(
          "Email Or Phone Number Is Required!",
          res
        );
      }

      if (data.phoneNumber) {
        const userExist = await User.findOne({ phoneNumber: data.phoneNumber });
        if (!userExist) {
          // If user does not exist
          return utilityFunc.sendErrorResponse("User does not exists", res);
        } else {
          // Get the password & Hash it
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(data.password, salt);
          // Compare the passwords
          if (data.password === hashedPassword) {
            // Create New the JWT token
            const newToken = await jwt.sign(
              {
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                data: data.phoneNumber,
              },
              env.JWT_SECRET
            );

            // Update the token in DB
            const newUser = await User.findOneAndUpdate(
              { phoneNumber: data.phoneNumber },
              { $set: { token: newToken } },
              { new: true }
            );
            return utilityFunc.sendSuccessResponse({
              login: true,
              exist: true,
              password: true,
              updatedToken: newToken,
              user: newUser,
            });
          } else {
            return utilityFunc.sendErrorResponse("Invalid password!", res);
          }
        }
      }
      if (data.email) {
        const userExist = await User.findOne({ email: data.email });
        if (!userExist) {
          return utilityFunc.sendErrorResponse("User does not exists", res);
        } else {
          // Get the password & Hash it
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(data.password, salt);
          // Compare the passwords
          if (data.password === hashedPassword) {
            // Create New the JWT token
            const newToken = await jwt.sign(
              {
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                data: data.email,
              },
              env.JWT_SECRET
            );

            // Update the token in DB
            const newUser = await User.findOneAndUpdate(
              { email: data.email },
              { $set: { token: newToken } }
            );
            return utilityFunc.sendSuccessResponse({
              login: true,
              exist: true,
              password: true,
              updatedToken: newToken,
              user: newUser,
            });
          }
        }
      }
    } catch (error) {
      console.log("error ==> ", error);
      utilityFunc.sendErrorResponse(error, res);
    }
  },
  getProfile: async (req, res) => {
    try {
      const data = req.body;
            const validationData = await utilityFunc.validationData(req.body, [
                "cryptoAdress", 
            ]);



      
    } catch (error) {
      console.log("error ==> ", error);
      utilityFunc.sendErrorResponse(error, res);
    }
  },
  userKYC: async (req, res) => {
    try {
      let data = req.body; // Get the data from the body
      let validationData = await utilityFunc.validationData(req.body, [
        "userId",
        "panNumber",
      ]);
      if (validationData && validationData.status) {
        return utilityFunc.sendErrorResponse(validationData.error, res);
      }
      // Finding the user from userId
      const userExist = await User.findOne({ _id: data.userId });
      if (userExist) {
        if (data.panNumber) {
          let panNumberJson = JSON.stringify({
            panNumber: `${data.panNumber}`,
          });

          const object = {
            url: "https://api.emptra.com/panCard/V3",
            method: "post",
            headers: {
              "Content-Type": "application/json",
              secretKey: env.KYCSecretKey,
              clientId: env.KYCClientId,
            },
            data: panNumberJson,
          };

          const response = await axios(object);

          if (response.data.code == 100) {
            const update = await User.findOneAndUpdate(
              { _id: data.userId },
              { $set: { kycDetail: response.data.result, isKYCDone: true } }
            );
            console.log("🚀 ~ file: user.js:428 ~ userKYC: ~ update:", update);
          } else {
            utilityFunc.sendErrorResponse("Verification Failed", response.data);
          }

          return utilityFunc.sendSuccessResponse(
            {
              login: true,
            },
            response.data
          );
        }

        if (data.adharNumber) {
          const adharRequestOtpUri = env.adharRequestOtpUri;
          const object = {
            url: adharRequestOtpUri,
            method: "post",
            headers: {
              "Content-Type": "application/json",
              secretKey: KYCSecretKey,
              clientId: KYCClientId,
            },
            data: data,
          };

          const response = await axios(object);
          if (response.result.success) {
            await User.findOneAndUpdate(
              { _id: data.userId },
              {
                $set: {
                  kycOTP: response.data.otp,
                  adharClientId: response.data.client_id,
                },
              }
            );
          } else {
            utilityFunc.sendErrorResponse("Verification Failed", res);
          }

          return utilityFunc.sendSuccessResponse(
            {
              login: true,
            },
            res
          );
        }
      } else {
        return utilityFunc.sendErrorResponse("User Doesn't Exists", res);
      }
    } catch (error) {
      return utilityFunc.sendErrorResponse("User Doesn't Exists", res);
    }
  },

  adharSumitOtp: async (req, res) => {
    try {
      let data = req.body;
      let validationData = await utilityFunc.validationData(req.body, [
        "kycOTP",
      ]);
      if (validationData && validationData.status) {
        return utilityFunc.sendErrorResponse(validationData.error, res);
      }

      if (!data.otp && !data.clientId) {
        return utilityFunc.sendErrorResponse(
          "OTP and ClientId is required!",
          res
        );
      }
      const adharSumitOtpUri = env.adharSumitOtpUri;
      const object = {
        url: adharSumitOtpUri,
        method: "post",
        headers: {
          "Content-Type": "application/json",
          secretKey: KYCSecretKey,
          clientId: KYCClientId,
        },
        data: { client_id: data.client_id, otp: data.otp },
      };
      const response = await axios(object);

      // res.send(response);

      if (response.result.success) {
        await User.findOneAndUpdate(
          { _id: data.userId },
          { $set: { isKYCDone: true, kycDetail: response.result } }
        );
      } else {
        utilityFunc.sendErrorResponse("Verification Failed", res);
      }

      return utilityFunc.sendSuccessResponse(
        {
          login: true,
        },
        res
      );
    } catch (error) {
      utilityFunc.sendErrorResponse(error, res);
      console.log("Error ==>", error);
    }
  },
}