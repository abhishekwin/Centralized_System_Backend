const express = require("express");
const router = express.Router();
const { userAuthentication } = require("../../utility/functions");
const spotController = require("./controller/spot");

router.post("/createOrder", userAuthentication, spotController.createOrder);

router.get("/orderBook", userAuthentication, spotController.getOrderBook);
module.exports = router;
