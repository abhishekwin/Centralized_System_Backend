const utilityFunc = require("../../../utility/socket");
// const utilityFunc = require("../../../utility/functions");
const MessageTable = require("../model/messageTable");
// const UserTable = require("../../user/model/userTable");
// const OrderTable = require("../../order/model/orderTable");

module.exports = {
  getAllMessage: async (req, res) => {
    try {
      data = req.decode;
      console.log("🚀 ~ file: chat.js:7 ~ chat: ~ data:", data);
      let validationData = await utilityFunc.validationData(req.body, [
        "orderId",
      ]);
      if (validationData && validationData.status) {
        return utilityFunc.validationData(validationData.error, res);
      }
      let allMessage = await MessageTable.find({
        orderId: req.body.orderId,
      }).sort({ createdAt: -1 });
      return utilityFunc.sendSuccessResponse(
        {
          message: "Get all Message For Order!",
          data: allMessage,
        },
        res
      );
    } catch (error) {
      console.log("🚀 ~ file: chat.js:60 ~ chat: ~ error:", error);
      return utilityFunc.validationData(error, res);
    }
  },
};
