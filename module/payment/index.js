const express = require("express");
const router = express.Router();
const paymentMethodController = require("./controller/payment");
const Authentication = require("../../utility/functions");

router.post("/createUpi",Authentication.userAuthentication,paymentMethodController.createUPI);
router.get("/getAllUpi",Authentication.userAuthentication,paymentMethodController.getUPI);
router.post("/deleteUpi",Authentication.userAuthentication,paymentMethodController.deleteUPI);

module.exports = router;
