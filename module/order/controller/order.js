const orderTable = require("../model/orderTable");
const postTable = require("../model/postTable");
const utilityFunc = require("../../../utility/functions");
const ObjectId = require("objectid");
const userTable = require("../../user/model/userTable");

module.exports = {
  createBuyOrder: async (req, resp) => {
    try {
      // TODO: Data Validation Here
      let validationData = await utilityFunc.validationData(req.body, [
        "amount",
        "quantity",
        "postId",
      ]);

      if (validationData && validationData.status) {
        throw new Error(validationData.error, resp);
      }

      //TODO: FINDING POST ID FROM THE POSTABLE
      let postData = await postTable.findById({ _id: req.body.postId });
      if (!postData) {
        throw new Error("Invalid Post Id", resp);
      }
      // console.log("🚀 ~ file: order.js:17 ~ createBuyOrder: ~ postData:", postData)

      const orderDetails = await orderTable.create({
        postedUserId: postData.userid,
        postId: req.body.postId,
        orderCreatedBy: req.decode._id,
        amount: req.body.amount,
        paymentId: req.body.paymentId,
        quantity: req.body.quantity,
        paymentMethod: postData.paymentMethod,
        sellerUPID: postData.sellerUPId,
        orderStatus: "OrderCreated",
      });

      return utilityFunc.sendSuccessResponse(
        {
          data: {
            message: " Buy Order Created",
            buyOrder: orderDetails,
          },
        },
        resp
      );
    } catch (err) {
      return utilityFunc.sendErrorResponse(err, resp);
    }
  },

  getorderById: async (req, resp) => {
    try {
      const orderId = req.params.id;
      if (!orderId) {
        throw new Error(`Order id is required!`);
      }

      const orderDetails = orderTable
        .findOne({ _id: ObjectId(orderId) })
        .populate("postId")
        .populate("postedUserId", "email address.userName")
        .populate("createdby", "email address.userName")
        .populate("paymentId", "upiId name");

      return utilityFunc.sendSuccessResponse(
        {
          data: {
            message: "get Order Deatils",
            buyOrder: orderDetails,
          },
        },
        resp
      );
    } catch (err) {
      return utilityFunc.sendErrorResponse(err, resp);
    }
  },

  updateOrderStatus: async (req, resp) => {
    try {
      let validationData = utilityFunc.validationData(req.body, [
        "status",
        "orderId",
      ]);

      if (validationData && validationData.status) {
        throw new Error("Invalid Validation Data");
      }

      let orderId = req.body.orderId;
      let updatedOrderStatus = req.body.status;

      let orderDeatils = await orderTable.findOneAndUpdate(
        { _id: orderId },
        { $set: { orderStatus: updatedOrderStatus } },
        { new: true }
      );
      // console.log(
      //   "🚀 ~ file: order.js:100 ~ updateOrderStatus: ~ postDetails:",
      //   postDetails
      // );

      // console.log(
      //   "🚀 ~ file: order.js:67 ~ updateOrderStatus: ~ postDetails:",
      //   orderDeatils
      // );
      if (!orderDeatils) {
        throw (new Error("Failed to Update Order Status"), resp);
      }

      return utilityFunc.sendSuccessResponse(
        {
          message: `Order Status Changed to ${updatedOrderStatus}`,
          updatedOrder: orderDeatils,
        },
        resp
      );
    } catch (err) {
      return utilityFunc.sendErrorResponse(err, resp);
    }
  },
  createSellOrder: async (req, resp) => {
    try {
      let validationData = await utilityFunc.validationData(req.body, [
        "amount",
        "quantity",
        "postId",
      ]);

      if (validationData && validationData.status) {
        throw new Error(validationData.error, resp);
      }

      //Get The Funding Wallet Address
      const fundingWalletBalance = await utilityFunc.getBalance(
        req.decode.cryptoAddress
      );
      console.log(
        "🚀 ~ file: order.js:152 ~ createSellOrder: ~ fundingWalletBalance:",
        fundingWalletBalance
      );

      if (fundingWalletBalance < req.body.amount) {
        throw new Error("Insufficient funds", resp);
      }

      let postData = await postTable.findById({ _id: req.body.postId });
      if (!postData) {
        throw new Error("Invalid Post Id", resp);
      }

      const orderDetails = await orderTable.create({
        postedUserId: postData.userid,
        postId: req.body.postId,
        orderCreatedBy: req.decode._id,
        amount: req.body.amount,
        paymentId: req.body.paymentId,
        quantity: req.body.quantity,
        paymentMethod: postData.paymentMethod,
        buyerUPID: postData.buyersUPId,
        orderStatus: "OrderCreated",
      });

      return utilityFunc.sendSuccessResponse(
        {
          data: {
            message: " Buy Order Created",
            buyOrder: orderDetails,
          },
        },
        resp
      );
    } catch (err) {}
  },
  completeOrder: async (req, resp) => {
    try {
      const validationData = await utilityFunc.validationData(req.body, [
        "orderId",
        "postId",
      ]);
      if (validationData && validationData.status) {
        throw new Error(validationData.error, resp);
      }

      //Get The Funding Wallet Address
      const fundingWalletBalance = await utilityFunc.getBalance(
        req.decode.cryptoAddress
      );
      console.log(
        "🚀 ~ file: order.js:152 ~ createSellOrder: ~ fundingWalletBalance:",
        fundingWalletBalance
      );

      const postDetails = await postTable.findById({ _id: req.body.postId });
      console.log(
        "🚀 ~ file: order.js:196 ~ completeOrder: ~ postDetails:",
        postDetails
      );
      const orderDetails = await orderTable.findById({ _id: req.body.orderId });
      console.log(
        "🚀 ~ file: order.js:198 ~ completeOrder: ~ orderDetails:",
        orderDetails
      );
      if (!postDetails && !orderDetails) {
        throw new Error("No post or order details found", resp);
      }

      let sellerUserId, buyerUserId, amount;

      if (postDetails.orderType === "BUY") {
        sellerUserId = orderDetails.orderCreatedBy; // Seller
        buyerUserId = orderDetails.postedUserId; // Buyer
      } else if (postDetails.orderType === "SELL") {
        buyerUserId = orderDetails.orderCreatedBy; //  Buyer
        sellerUserId = orderDetails.postedUserId; // Seller
      }

      const updatedBuyerFundingBalance = await userTable.findByIdAndUpdate(
        { _id: buyerUserId },
        { $set: { fundingBalance: fundingBalance - amount } },
        { new: true }
      );
      console.log(
        "🚀 ~ file: order.js:224 ~ completeOrder: ~ updatedBuyerFundingBalance:",
        updatedBuyerFundingBalance
      );

      const updatedSellerFundingBalancce = await userTable.findByIdAndUpdate(
        { _id: sellerUserId },
        { $set: { fundingBalance: fundingBalance - amount } },
        { new: true }
      );
      console.log(
        "🚀 ~ file: order.js:232 ~ completeOrder: ~ updatedSellerFundingBalancce:",
        updatedSellerFundingBalancce
      );

      if (postDetails.available <= 0) {
        await postTable.findByIdAndUpdate(
          { _id: postDetails._id },
          { $set: { postStatus: "Completed" } },
          { new: true }
        );
        await orderTable.findByIdAndUpdate(
          { _id: orderDetails._id },
          { $set: { orderStatus: "Completed" } },
          { new: true }
        );
      } else {
        await postTable.findByIdAndUpdate(
          { _id: postDetails._id },
          { $set: { postStatus: "InProgress" } },
          { new: true }
        );
        await orderTable.findByIdAndUpdate(
          { _id: orderDetails._id },
          { $set: { orderStatus: "Completed" } },
          { new: true }
        );
      }

      // FIXME: Funding wallet balance should be updated for both parties

      return utilityFunc.sendSuccessResponse(
        {
          data: {
            message: `Order Status Completed`,
            postStatus: postDetails.postStatus,
            orderStatus: orderDetails.orderStatus,
          },
        },
        resp
      );
    } catch (error) {
      return utilityFunc.sendErrorResponse(error, resp);
    }
  },
  cancelledOrder: async (req, resp) => {
    try {
      const validationData = await utilityFunc.validationData(req.body, [
        "orderId",
        "postId",
      ]);
      console.log(
        "🚀 ~ file: order.js:225 ~ cancelledOrder: ~ validationData:",
        validationData
      );

      if (validationData && validationData.status) {
        throw new Error(validationData.error, resp);
      }

      const orderDeatils = await orderTable.findByIdAndUpdate(
        { _id: req.body.orderId },
        { $set: { orderStatus: "Cancelled" } },
        { new: true }
      );
      console.log(
        "🚀 ~ file: order.js:235 ~ cancelledOrder: ~ orderDeatils:",
        orderDeatils
      );

      if (!orderDeatils) {
        throw new Error("Order Failed to Cancelled", resp);
      }

      console.log("dsfdsfsdfsd");

      return utilityFunc.sendSuccessResponse(
        {
          data: {
            message: "Order Status Cancelled",
            orderStatus: orderDeatils.orderStatus,
          },
        },
        resp
      );
    } catch (error) {
      console.log("asfdsadsadas");
      return utilityFunc.sendErrorResponse(error, resp);
    }
  },
};
