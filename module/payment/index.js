const express = require("express");
const router = express.Router();
const paymentMethodController = require("./controller/payment");
const Authentication = require("../../utility/functions");
const { userAuthentication } = require("../../utility/functions");
router.post("/createUpi",userAuthentication,paymentMethodController. createUPI);
router.get("/getAllUpi",userAuthentication,paymentMethodController.getUPI);
router.post("/deleteUpi",userAuthentication,paymentMethodController.deleteUPI);
// router.post('/withdraw',Authentication.userAuthentication, paymentMethodController.AssetTransferFromHotWallet)
router.post("/withdraw", paymentMethodController.AssetTransferFromHotWallet)
router.get("/getWalletBalance",Authentication.userAuthentication, paymentMethodController.getFundingWalletAmount);

module.exports = router;
