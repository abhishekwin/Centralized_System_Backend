const Payment = require("../model/paymentTable");
const utilityFunc = require("../../../utility/functions");
const jwt = require("jsonwebtoken");
const env = require("../../../config/env");
const bcrypt = require("bcrypt");
const axios = require("axios");
const User = require("../../user/model/userTable");
module.exports = {
  createUPI: async (req, res) => {
    try {
      let data = req.body;
      let validationData = await utilityFunc.validationData(req.body, [
        "upiId",
        "name",
      ]);
      if (validationData && validationData.status) {
        return utilityFunc.sendErrorResponse(validationData.error, res);
      }
      const userExists = await User.findOne({ _id: req.decode._id });
      if (userExists) {
        let newUpi = await Payment.create({
          userId: req.decode._id,
          name: data.name,
          upiId: data.upiId,
          qrcode: data.qrcode,
        });

        return utilityFunc.sendSuccessResponse(
          {
            login: true,
            exist: true,
            password: true,
            otp: false,
            user: newUpi,
          },
          res
        );
      } else {
        return utilityFunc.sendErrorResponse("User doesn't exists", res);
      }
    } catch (error) {
      return utilityFunc.sendErrorResponse(error, res);
    }
  },
  getUPI: async (req, res) => {
    try {
        let allPayements = await Payment.find({
          userId: req.decode._id,
          status: true
        });
        return utilityFunc.sendSuccessResponse(
          {
            message: "Get All Payments!",
            data: allPayements,
          },
          res
        );
    } catch (error) {
      console.log("error", error);
      return utilityFunc.sendErrorResponse(error, res);
    }
  },
  deleteUPI: async (req, res) => {
    try {
      let data = req.body;
      let validationData = await utilityFunc.validationData(req.body, [
        "paymentId",
      ]);

      if (validationData && validationData.status) {
        return utilityFunc.sendErrorResponse(validationData.error, res);
      }
      const paymentExist = await Payment.findOne({
        _id: req.body.paymentId,
        status: true
      });

      if (paymentExist) {
        await Payment.findOneAndUpdate(
          { _id: req.body.paymentId },
          { $set: { status: false } }
        );
        return utilityFunc.sendSuccessResponse(
          {
            message: "UPI Deleted",
            success: true
          },
          res
        );
      }else{
        return utilityFunc.sendErrorResponse("Payment Not Exist!", res);
      }
    } catch (error) {
      console.log("error", error);
      return utilityFunc.sendErrorResponse(error, res);
    }
  },
  AssetTransferFromHotWallet: async (req, res) => {
    try {
        const data = req.body;
        const validationData = await utilityFunc.validationData(req.body, [
            "toAddress",
            "fromAddress",
            "amount",
        ]);

        if (validationData && validationData.status) {
            return utilityFunc.sendErrorResponse(validationData.errorMessage, res);
        }

        // check user wallet balance here from db ;
        const userBalance = await utilityFunc.getUserByPublicAddress(
            data.fromAddress
        ).balance;

        // let wallet = await utilityFunc.HotWalletAccess()
        if (userBalance < data.amount) {
            return utilityFunc.sendErrorResponse("User have insufficient balance", res);
        }
        const result = await utilityFunc.TransferFundsFromHotWallet(
            data.toAddress,
            data.amount
        );
        return result;
        // console.log(result);

        if (result) {
            // update wallet balance of user
        }
        return result;
    } catch (error) {
        console.log(error);
    }
},
};
