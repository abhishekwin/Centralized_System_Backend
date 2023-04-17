const express = require("express");
const router = express.Router();
const orderController = require("./controller/order");
const Authentication = require("../../utility/functions");

//@desc API for creating Buy P2P Orders user can create new buy order using this API
//@route order/createBuyPost
//@access private
router.post(
  "/createBuyPost",Authentication.userAuthentication, orderController.createBuyPost
);
//@desc API for creating Sell P2P Orders user can create new sell order using this API
//@route order/createSellPost
//@access private
router.post("/createSellPost",Authentication.userAuthentication,orderController.createSellPost);
//@desc API for getting the buy order details user can get details about the  buy order
//@route order/getBuyPosts
//@access private
router.post("/getBuyPosts", Authentication.userAuthentication, orderController.getBuyPosts);
//@desc API for getting the sell order details user can get details about the sell order
//@route order/getSellPosts
//@access private
router.get("/getSellPosts", Authentication.userAuthentication, orderController.getSellPosts);


module.exports = router;