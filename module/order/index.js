const express = require("express");
const router = express.Router();
const postController = require("./controller/posts");
// const orderController = require("./controller/order");
const Authentication = require("../../utility/functions");

//@desc API for creating Buy P2P Orders user can create new buy order using this API
//@route order/createBuyPost
//@access private
router.post(
  "/createBuyPost",Authentication.userAuthentication, postController.createBuyPost
);
//@desc API for creating Sell P2P Orders user can create new sell order using this API
//@route order/createSellPost
//@access private
router.post("/createSellPost",Authentication.userAuthentication,postController.createSellPost);
//@desc API for getting the buy order details user can get details about the  buy order
//@route order/getBuyPosts
//@access private
router.post("/getBuyPosts", Authentication.userAuthentication, postController.getBuyPosts);
//@desc API for getting the sell order details user can get details about the sell order
//@route order/getSellPosts
//@access private
router.post("/getSellPosts", Authentication.userAuthentication, postController.getSellPosts);

//@desc API for getting the order details based on userId 
//@route order/getOrderDetails
//@access private
router.get("/getOrder/:id", Authentication.userAuthentication, postController.getorderById);


//@desc API for Buy order
//@route order/buyOrder
//@access private
// router.post("/buyOrder", Authentication.userAuthentication, orderController.buyOrder);
module.exports = router;
