const express = require("express");
const router = express.Router();
const orderController = require("./controller/order");
const Authentication = require("../../utility/functions");

router.post("/postBuyOrder",Authentication.userAuthentication, orderController,orderController.createBuyOrder);
router.post("/postSellOrder",Authentication.userAuthentication,orderController,orderController.createSellOrder);

router.get("/getBuyOrder",Authentication.userAuthentication,orderController,orderController.getOrderDetails);
router.get("/getSellOrder",Authentication.userAuthentication,orderController,orderController.sellOrderDetails);
