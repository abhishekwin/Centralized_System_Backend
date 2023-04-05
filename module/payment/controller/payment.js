const Payment = require("../model/paymentTable");
const utilityFunc = require("../../../utility/functions");
const jwt = require("jsonwebtoken");
const env = require("../../../config/env");
const bcrypt = require("bcrypt");
const axios = require("axios");

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
        let newUpi = await PaymentMethod.create({
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
      const userExists = await User.findOne({ _id: req.decode._id });

      if (userExists) {
        let upiIds = await PaymentMethod.findOne({
          userId: req.decode.userDetails.userId,
        });
        return utilityFunc.sendSuccessResponse(
          {
            exist: true,
            data: upiIds.upiId,
          },
          res
        );
      }
    } catch (error) {
      console.log("error", error);
      return utilityFunc.sendErrorResponse(error, res);
    }
  },
  deleteUPI: async (req, res) => {
    try {
      let data = req.body;
      let validationData = await utilityFunc.validationData(req.body, [
        "userId",
      ]);

      if (validationData && validationData.status) {
        return utilityFunc.sendErrorResponse(validationData.error, res);
      }

      const userExists = await PaymentMethod.findOne({
        userId: req.decode.userDetails.userId,
      });

      if (userExists) {
        await PaymentMethod.findOneAndUpdate(
          { userId: req.decode.userDetails.userId },
          { $set: { status: false } }
        );
        return utilityFunc.sendSuccessResponse(
          {
            message: "UPI Deleted",
            exist: true,
          },
          res
        );
      }
    } catch (error) {}
  },
};
