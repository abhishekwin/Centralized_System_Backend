const express = require("express");
const router = express.Router();
const orderController = require("./controller/order");
const Authentication = require("../../utility/functions");

//@desc API for creating Buy P2P Orders user can create new buy order using this API
//@route order/createBuyOrder
//@access public 
router.post("/createBuyOrder",Authentication.userAuthentication, orderController,orderController.createBuyOrder);
//@desc API for creating Sell P2P Orders user can create new sell order using this API
//@route order/createSellOrder
//@access public 
router.post("/createSellOrder",Authentication.userAuthentication,orderController,orderController.createSellOrder);
//@desc API for getting the buy order details user can get details about the  buy order
//@route order/getBuyOrder
//@access public 
router.get("/getBuyOrder",Authentication.userAuthentication,orderController,orderController.getOrderDetails);
//@desc API for getting the sell order details user can get details about the sell order
//@route order/getSellOrder
//@access public 
router.get("/getSellOrder",Authentication.userAuthentication,orderController,orderController.sellOrderDetails);
