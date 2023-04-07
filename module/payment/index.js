const express = require("express");
const router = express.Router();
const paymentMethodController = require("./controller/payment");
const Authentication = require("../../utility/functions");

router.post("/createUpi",Authentication.userAuthentication,paymentMethodController.createUPI);
router.get("/getUpi",Authentication.userAuthentication,paymentMethodController.getUPI);
router.post("/deleteUpi",Authentication.userAuthentication,paymentMethodController.deleteUPI);
// router.post('/withdraw',Authentication.userAuthentication, paymentMethodController.AssetTransferFromHotWallet)
router.post('/withdraw', paymentMethodController.AssetTransferFromHotWallet)

module.exports = router;
