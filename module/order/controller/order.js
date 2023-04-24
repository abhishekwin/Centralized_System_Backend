const orderTable = require("../model/orderTable");
const postTable = require("../model/postTable");
const utilityFunc = require("../../../utility/functions");
const ObjectId = require("objectid");

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
        createdBy: req.decode._id,
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

      let postDetails = await postTable.findById({ _id: orderDeatils.postId });

      if (postDetails.available > 0) {
        // Change the Post Order Status to In Progress
        await postTable.findOneAndUpdate(
          { _id: orderDeatils.postId },
          { $set: { postStatus: "InProgress" } }
        );
      } else if (postDetails.available <= 0) {
        await postTable.findOneAndUpdate(
          { _id: orderDeatils.postId },
          { $set: { postStatus: "Completed" } }
        );
      }
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
};
