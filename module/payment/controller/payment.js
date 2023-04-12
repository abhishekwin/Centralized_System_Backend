const Payment = require("../model/paymentTable");
const utilityFunc = require("../../../utility/functions");
const jwt = require("jsonwebtoken");
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
        let UpiExist = await Payment.findOne({upiId : data.upiId});
        console.log("🚀 ~ file: payment.js:25 ~ createUPI: ~ UpiExist:", UpiExist);

        if(UpiExist === null){

          let newUpi = await Payment.create({
            paymentId: req.decode._id,
            name: data.name,
            upiId: data.upiId,
            qrcode: data.qrcode,
          });
          console.log("🚀 ~ file: payment.js:30 ~ createUPI: ~ newUpi:", newUpi)
          
          return utilityFunc.sendSuccessResponse(
            {data:{
              login: true,
              exist: true,
              password: true,
              otp: false,
              payment: newUpi,
            }},
            res
          );
          
        }
        else{
          
          if(UpiExist.upiId === data.upiId){
            return utilityFunc.sendErrorResponse({
              message : "UPI already added"
            },res)
          }
          else{
            let newUpi = await Payment.create({
              paymentId: req.decode._id,
              name: data.name,
              upiId: data.upiId,
              qrcode: data.qrcode,
            });
            console.log("🚀 ~ file: payment.js:30 ~ createUPI: ~ newUpi:", newUpi)
            
            return utilityFunc.sendSuccessResponse(
              {data:{
                login: true,
                exist: true,
                password: true,
                otp: false,
                payment: newUpi,
              }},
              res
            );
          }
        }
      } else {
        return utilityFunc.sendErrorResponse("User doesn't exists", res);
      }
    } catch (error) {
     console.log("🚀 ~ file: payment.js:56 ~ createUPI: ~ error:", error)
     
      return utilityFunc.sendErrorResponse(error, res);
    }
  },
  getUPI: async (req, res) => {
    try {
        let allPayements = await Payment.find({
          paymentId: req.decode._id,
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
        "upiId",
      ]);

      if (validationData && validationData.status) {
        return utilityFunc.sendErrorResponse(validationData.error, res);
      }
      const paymentExist = await Payment.find({
        paymentId: req.decode.paymentId,
        status: true
      });
      let UpiExist = await Payment.findOne({upiId : data.upiId});
      console.log("🚀 ~ file: payment.js:118 ~ deleteUPI: ~ paymentExist:", UpiExist._id);

      if (UpiExist) {
        await Payment.findOneAndUpdate(
          { _id: UpiExist._id },  
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
        const userBala̵nce = await utilityFunc.getUserByPublicAddress(
            data.fromAddress
        ).balance;
        console.log("🚀 ~ file: payment.js:158 ~ AssetTransferFromHotWallet: ~ userBala̵nce:", userBala̵nce)

        // let wallet = await utilityFunc.HotWalletAccess()
        if (userBala̵nce < data.amount) {
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
