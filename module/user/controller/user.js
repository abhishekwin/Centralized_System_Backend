const User = require("../../user/model/userTable");
const utilityFunc = require("../../../utility/functions");
var jwt = require("jsonwebtoken");
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

      if (data.phoneNumber) {
        userExist = await User.findOne({ phoneNumber: data.phoneNumber });
        if (userExist) {
          return utilityFunc.sendSuccessResponse(
            {
              data: {
                login: false,
                exist: true,
                password: true,
                user: userExist,
              },
            },
            res
          );
        } else {
          //Generate Crypto Address Here
          const walletdata = await utilityFunc.GenratePrivateKey();
          console.log(walletdata);
          console.log(walletdata.publicAddress, walletdata.wId, "generated");

          let OTPData = await utilityFunc.createMsg(req);
          if (OTPData && OTPData.body) {
            var numb = OTPData.body.match(/\d/g);
            numb = numb.join("");

            let token = await jwt.sign(
              {
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                data: data.phoneNumber,
              },
              process.env.JWT_SECRET
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
                data: {
                  login: true,
                  exist: true,
                  password: true,
                  otp: false,
                  user: userNew,
                },
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
            {
              data: {
                login: false,
                exist: true,
                password: true,
                user: userExist,
              },
            },
            res
          );
        } else {
          //Generate Crypto Address Here
          const walletdata = await utilityFunc.GenratePrivateKey();
          console.log(walletdata);
          console.log(walletdata.publicAddress, walletdata.wId, "generated");

          let OTPData = await utilityFunc.createEmail(req);
          if (OTPData && OTPData.OTP) {
            let token = await jwt.sign(
              {
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                data: data.email,
              },
              process.env.JWT_SECRET
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
                data: {
                  login: true,
                  exist: true,
                  password: true,
                  otp: false,
                  user: userNew,
                },
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
            data: {
              login: true,
              exist: true,
              token: token,
              user: userExist,
            },
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
            data: {
              login: true,
              exist: true,
              token: token,
              user: newUser,
            },
          },
          res
        );
      }
    }
    if (data.phoneNumber) {
      userExist = await User.findOne({ phoneNumber: data.phoneNumber });
      console.log("userExist", userExist);
      if (userExist) {
        return utilityFunc.sendSuccessResponse(
          { login: false, exist: true, password: true, user: userExist },
          res
        );
      } else {
        return utilityFunc.sendSuccessResponse({}, res, {
          login: false,
          exist: false,
          password: true,
        });
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
              message: "Account Verified !",
              data: {
                login: true,
                exist: true,
                token: userFound.token,
                user: userFound,
              },
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
              message: "Account Verified !",
              data: {
                login: true,
                exist: true,
                token: userFound.token,
                user: userFound,
              },
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
          let passcheck = await bcrypt.compare(
            data.password,
            userExist.password
          );
          console.log("🚀 ~ file: user.js:360 ~ login: ~ passcheck:", passcheck)
          
          // Compare the passwords
          if (passcheck) {
            console.log("🚀 ~ file: user.js:363 ~ login: ~ passcheck:", passcheck)
            
            // Create New the JWT token
            const newToken = await jwt.sign(
              {
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                data: data.phoneNumber,
              },
              process.env.JWT_SECRET
            );

            // Update the token in DB
            const newUser = await User.findOneAndUpdate(
              { phoneNumber: data.phoneNumber },
              { $set: { token: newToken } },
              { new: true }
            );
            return utilityFunc.sendSuccessResponse({
              data: {
                login: true,
                exist: true,
                password: true,
                updatedToken: newToken,
                user: newUser,
              },
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
          let passcheck = await bcrypt.compare(
            data.password,
            userExist.password
          );
          
          // Compare the passwords
          if (passcheck) {
            // Create New the JWT token
            const newToken = await jwt.sign(
              {
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                data: data.email,
              },
              process.env.JWT_SECRET
            );

            // Update the token in DB
            const newUser = await User.findOneAndUpdate(
              { email: data.email },
              { $set: { token: newToken } }
            );
            return utilityFunc.sendSuccessResponse({
              data: {
                login: true,
                exist: true,
                password: true,
                updatedToken: newToken,
                user: newUser,
              },
            },res);
          }
        }
      }
    } catch (error) {
      console.log("error ==> ", error);
      utilityFunc.sendErrorResponse(error, res);
    }
  },
  resendOtp : async (req, res) => {
     try {
      let data = req.body;
      if (!data.email && !data.phoneNumber) {
        return utilityFunc.sendErrorResponse(
          "Email Or Phone Number Is Required!",
          res
        );
      }
  
      if (data.phoneNumber) {
        let userExist = await User.findOne({phoneNumber : data.phoneNumber});
  
        if(userExist){
          let OTP = await utilityFunc.createMsg(req);
          await User.findOneAndUpdate(
            {phoneNumber : data.phoneNumber},
            { $set :{OTP : OTP}}
          )
          return utilityFunc.sendSuccessResponse({
              message : "OTP Sent!"
          },res);
        }
      }
      if(data.email){
        let userExist = await User.findOne({email : data.email});
        if(userExist){
          let OTP = await utilityFunc.createEmail(req);
          await User.findOneAndUpdate(
            {email : data.email},
            { set : {OTP : OTP.OTP}}
          );
          return utilityFunc.sendSuccessResponse({
            message : "OTP Sent!"
          },res);
        }
        else{
          return utilityFunc.sendErrorResponse({
            message : "User Doesn't Exists !"
          },res);
        }
      }
     } catch (error) {
      console.log("🚀 ~ file: user.js:468 ~ resendOtp: ~ error:", error)
      return utilityFunc.sendErrorResponse({
        error
      },res);
     } 
  },
  getProfile: async (req, res) => {
    try {
      const data = req.decode; // Get The Data from the Request
      if (data.cryptoAddress === null || data.cryptoAddress === "") {
        return utilityFunc.sendErrorResponse("CryptoAddress Invalid!", res);
      }
      const userBalance = await utilityFunc.getBalance(data.cryptoAddress);

      return utilityFunc.sendSuccessResponse(
        {
          data: {
            balance: userBalance,
          },
        },
        res
      );
    } catch (error) {
      console.log("error ==> ", error);
      utilityFunc.sendErrorResponse(error, res);
    }
  },
  userKYC: async (req, res) => {
    try {
      let data = req.body; // Get the data from the body

      if (!req.decode) {
        return utilityFunc.sendErrorResponse("Invalid User", res);
      }
      if (!data.aadhaarNumber && !data.panNumber) {
        return utilityFunc.sendErrorResponse(
          "Please Enter Adhar Number or Pan Number",
          res
        );
      }
      // Finding the user from userId
      const userExist = await User.findOne({ _id: req.decode._id });
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
              secretKey: process.env.KYCSecretKey,
              clientId: process.env.KYCClientId,
            },
            data: panNumberJson,
          };

          const response = await axios(object);

          if (response.data.code == 100) {
            const update = await User.findOneAndUpdate(
              { _id: req.decode._id },
              { $set: { kycDetail: response.data.result, isKYCDone: true } }
            );
          } else {
            utilityFunc.sendErrorResponse("Verification Failed", response);
          }

          return utilityFunc.sendSuccessResponse(
            {
              data: response.data,
              login: true,
            },
            res
          );
        }

        if (data.aadhaarNumber) {
          let aadhaarNumberJson = JSON.stringify({
            aadhaarNumber: `${data.aadhaarNumber}`,
          });
          const aadharRequestOtpUri = process.env.adharRequestOtpUri;

          const object = {
            method: "post",
            url: aadharRequestOtpUri,
            headers: {
              "Content-Type": "application/json",
              secretKey: process.env.KYCSecretKey,
              clientId: process.env.KYCClientId,
            },
            data: aadhaarNumberJson,
          };
          const response = await axios(object);
          if (response.data.success) {
            await User.findOneAndUpdate(
              { _id: req.decode._id },
              {
                $set: {
                  kycOTP: response.data.otp,
                  adharClientId: response.data.client_id,
                },
              },
              { new: true }
            );
          }

          return utilityFunc.sendSuccessResponse(
            {
              data: response.data,
              login: true,
            },
            res
          );
        }
      } else {
        return utilityFunc.sendErrorResponse("User Doesn't Exists", res);
      }
    } catch (error) {
      console.log("error ==> ", error);
      return utilityFunc.sendErrorResponse("User Doesn't Exists", res);
    }
  },


  adharSumitOtp: async (req, res) => {
    try {
      let data = req.body;
      if (!data.otp && !data.clientId) {
        return utilityFunc.sendErrorResponse(
          "OTP and ClientId is required!",
          res
        );
      }

      let aadhaarOtp = JSON.stringify({
        client_id: `${data.client_id}`,
        otp: `${data.otp}`,
      });
      const adharSumitOtpUri = process.env.adharSumitOtpUri;
      const object = {
        url: adharSumitOtpUri,
        method: "post",
        headers: {
          "Content-Type": "application/json",
          secretKey: process.env.KYCSecretKey,
          clientId: process.env.KYCClientId,
        },
        data: aadhaarOtp,
      };
      const response = await axios(object);

      if (response.data.result.success) {
        await User.findOneAndUpdate(
          { _id: req.decode._id },
          { $set: { isKYCDone: true, kycDetail: response.result } },
          { new: true }
        );
      } else {
        utilityFunc.sendErrorResponse("Verification Failed", res);
      }

      return utilityFunc.sendSuccessResponse(
        {
          data: response.data,
          login: true,
        },
        res
      );
    } catch (error) {
      utilityFunc.sendErrorResponse(error, res);
      console.log("Error ==>", error);
    }
  },
  updateUserProfile: async (req, res) => {
    const data = req.body;
    const userExist = await User.findOne({ _id: req.decode._id });
    if (userExist) {
      await User.findOneAndUpdate(
        { _id: req.decode._id },
        {
          $set: {
            address: {
              userName: data.userName,
              nationality: data.nationality,
              dateOfBirth: data.dateOfBirth,
              fullAddress: data.fullAddress,
              pinCode: data.pinCode,
              city: data.city,
              country: data.country,
              
            },
            aadharCardNo: data.aadharCardNo,
            pancardNo: data.pancardNo,
          },
        },
        { new: true }
      );
      return utilityFunc.sendSuccessResponse(
        {
          message: "UserName Updated",
          exist: true,
          data: data,
        },
        res
      );
    } else {
      return utilityFunc.sendErrorResponse("User Doesn't Exists", res);
    }
  },
  updateEmailPhone: async (req, res) => {
    try {
      let data = req.body;
      if (!data.email && !data.phoneNumber) {
        return utilityFunc.sendErrorResponse(
          "Please Enter Email or Phone",
          res
        );
      }
      if (data.email) {
        let emailExist = await User.find({ email: req.body.email });
        if (emailExist.length > 0) {
          return utilityFunc.sendErrorResponse(
            {
              message: "Email Already Exist",
            },
            res
          );
        } else {
          let OTP = await utilityFunc.createEmail(req);
          console.log("🚀 ~ file: user.js:605 ~ updateEmailPhone: ~ OTP:", OTP.OTP);

          await User.findOneAndUpdate(
            { _id: req.decode._id },
            { $set: { email: data.email, OTP: OTP.OTP, isEmailVerified: false } }
          );
          return utilityFunc.sendSuccessResponse(
            {
              message: "Email Updated",
              success: true,
            },
            res
          );
        }
      } else
       if (data.phoneNumber) {
        let phoneNumberExist = await User.find({
          phoneNumber: req.body.phoneNumber,
        });
        if (phoneNumberExist.length > 0) {
          return utilityFunc.sendErrorResponse(
            {
              message: "Phone Number Already exists",
            },
            res
          );
        } else {
          let OTP = await utilityFunc.createMsg(req);
          console.log("🚀 ~ file: user.js:626 ~ updateEmailPhone: ~ OTP:", OTP);
          await User.findOneAndUpdate(
            { _id: req.decode._id },
            {
              $set: {
                phoneNumber: data.phoneNumber,
                OTP: OTP.OTP,
                isPhoneVerified: false,
              },
            }
          );
          return utilityFunc.sendSuccessResponse(
            {
              message: "Phone Number Updated",
              success: true,
            },
            res
          );
        }
      } else {
        return utilityFunc.sendErrorResponse(
          {
            message: "Failed to Update Email or Phone",
          },
          res
        );
      }
    } catch (error) {
      console.log("🚀 ~ file: user.js:636 ~ updateEmailPhone: ~ error:", error);

      return utilityFunc.sendErrorResponse(
        {
          error
        },
        res
      );
    }
  },
  forgotPassword: async (req, res) => {
    try {
      let data = req.body;
      console.log("🚀 ~ file: user.js:655 ~ forgotPassword: ~ data:", data);
      if (!data.email && !data.phoneNumber) {
        return utilityFunc.sendErrorResponse(
          {
            message: "Please Enter Email or Phone Number!",
          },
          res
        );
      }
      if (data.email) {
        let emailExist = await User.find({ email: req.body.email });
        if (emailExist.length > 0) {
          let OTP = await utilityFunc.createEmail(req);
          console.log("🚀 ~ file: user.js:668 ~ forgotPassword: ~ OTP:", OTP);
          if (data.NewPassword === data.confirmPassword) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.NewPassword, salt);
            await User.findOneAndUpdate(
              { email: data.email },
              {
                $set: {
                  password: hashedPassword,
                  isEmailVerified: false,
                  OTP: OTP.OTP,
                },
              }
            );
            return utilityFunc.sendSuccessResponse(
              {
                message: "Password Updated",
                success: true,
              },
              res
            );
          } else {
            return utilityFunc.sendErrorResponse(
              {
                message: "Password doesn't match!",
              },
              res
            );
          }
        } else {
          return utilityFunc.sendErrorResponse(
            {
              message: "Email Doesn't Exists!",
            },
            res
          );
        }
      } else {
        if (data.phoneNumber) {
          let phoneNumberExist = await User.find({
            phoneNumber: req.body.phoneNumber,
          });
          if (phoneNumberExist.length > 0) {
            let OTP = await utilityFunc.createMsg(req);

            if (data.NewPassword == data.confirmPassword) {
              const salt = await bcrypt.genSalt(10);
              const hashedPassword = await bcrypt.hash(data.NewPassword, salt);
              await User.findOneAndUpdate(
                { _id: req.decode._id },
                {
                  $set: {
                    password: hashedPassword,
                    OTP: OTP,
                    isPhoneVerified: false,
                  },
                }
              );
              return utilityFunc.sendSuccessResponse(
                {
                  message: "Password Updated",
                  data:{
                    success: true
                  },
                 
                },
                res
              );
            } else {
              return utilityFunc.sendErrorResponse(
                {
                  message: "Password Doesn't Match!",
                },
                res
              );
            }
          }
        }
      }
    } catch (error) {
      console.log("error", error);
      return utilityFunc.sendErrorResponse({ error }, res);
    }
  },
  changePassword: async (req, res) => {
    try {
      let data = req.body;
      let pas̵swordExist = await User.findOne({ _id: req.decode._id });
      let passcheck = await bcrypt.compare(
        data.oldPassword,
        pas̵swordExist.password
      );

      if (passcheck) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.NewPassword, salt);
        await User.findOneAndUpdate(
          { _id: req.decode._id },
          { $set: { password: hashedPassword } }
        );
        return utilityFunc.sendSuccessResponse(
          {
            message: "Password Changed",
           data:{
            success:true
           }
          },
          res
        );
      } else {
        return utilityFunc.sendErrorResponse(
          { message: "Wrong Password!" },
          res
        );
      }
    } catch (error) {
      return utilityFunc.sendErrorResponse({ error }, res);
    }
  },
};
