const express = require("express");
const router = express.Router();
const postController = require("./controller/posts");
const orderController = require("./controller/order");
const Authentication = require("../../utility/functions");

//@desc API for creating Buy P2P Orders user can create new buy order using this API
//@route order/createBuyPost
//@access private
router.post("/createBuyPost",Authentication.userAuthentication, postController.createBuyPost);

//@desc API for creating Sell P2P Orders user can create new sell order using this API
//@route order/createSellPost
//@access private
router.post("/createSellPost",Authentication.userAuthentication,postController.createSellPost);
//@desc API for getting the buy order details user can get details about the  buy order
//@route order/getBuyPosts
//@access private
router.post("/getBuyPosts",Authentication.userAuthentication,postController.getBuyPosts);
//@desc API for getting the sell order details user can get details about the sell order
//@route order/getSellPosts
//@access private
router.post("/getSellPosts",Authentication.userAuthentication,postController.getSellPosts
);

//@desc API for getting the order details based on userId
//@route order/getOrderDetails
//@access private

router.get("/getPostById/:id",Authentication.userAuthentication,postController.getPostById);

//@desc API for Buy order
//@route order/buyOrder
//@access private
router.post( "/createBuyOrder",Authentication.userAuthentication,orderController.createBuyOrder);

//@desc API for Get Order
//@route order/order/:id
//@access private
router.get("/order/:id",Authentication.userAuthentication,orderController.getorderById);

//@desc API for Changing Order Status
//@route order/updateOrderStatus
//@access private

router.post("/updateOrderStatus",Authentication.userAuthentication,orderController.updateOrderStatus);


//@desc API for Order Complete Status
//@route order/completeOrderStatus
//@access private

router.post("/completeOrderStatus",Authentication.userAuthentication,orderController.completeOrder)

//@desc API for Cancel Order 
//@route order/cancelOrder
//@access private

router.post("/cancelOrderStatus",Authentication.userAuthentication,orderController.cancelledOrder);

module.exports = router;
