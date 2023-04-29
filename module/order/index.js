const express = require("express");
const router = express.Router();
const postController = require("./controller/PostAd");
const orderController = require("./controller/order");
const Authentication = require("../../utility/functions");

//@desc API for creating Buy P2P Orders user can post new buy p2p Ads using this API
//@route order/createBuyPost
//@access private
router.post(
  "/createBuyPostAd",
  Authentication.userAuthentication,
  postController.createBuyPostAd
);
//@desc API for creating Sell P2P Orders user can create new sell order using this API
//@route order/createSellPost
//@access private
router.post(
  "/createSellPostAd",
  Authentication.userAuthentication,
  postController.createSellPostAd
);
module.exports = router;

//@desc API for proceed sell usdt order where user can sell usdt or CryprtoAssets for Buy usdt Ad
//@route order/sellUSDT
//@access private
router.post(
  "/sellUSDT",
  Authentication.userAuthentication,
  orderController.sellUsdt
);
//@desc API for getting the sell order details user can get details about the sell order
//@route order/getSellPosts
//@access private
// router.post("/getSellPosts", Authentication.userAuthentication, postController.getSellPosts);

//@desc API for getting the order details based on userId
//@route order/getOrderDetails
//@access private
// router.get("/getOrder/:id", Authentication.userAuthentication, postController.getorderById);

router.post("/updateOrderStatusForSellUsdt", Authentication.userAuthentication, orderController.updateOrderStatusForSellUsdt);