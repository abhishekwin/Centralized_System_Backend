const BuyOrder = require("../model/buyOrderTable");
const SellOrder = require("../model/sellOrderTable");
const utilityFunc = require("../../../utility/functions");
const { default: axios } = require("axios");

module.exports = {
  getBuyOrder: async (req, resp) => {
    try {
      const userId = req.decode._id;
      console.log("🚀 ~ file: order.js:10 ~ getBuyOrder: ~ userId:", userId);
      const orderDetails = await BuyOrder.find({
        userId: userId,
      });
      if (!orderDetails) {
        return utilityFunc.sendErrorResponse(
          { message: "Order Not Found", data: {} },
          resp
        );
      }

      return utilityFunc.sendSuccessResponse(
        {
          message: "Order Details",
          data: {
            orderDetails,
          },
        },
        resp
      );
    } catch (err) {
      console.log("🚀 ~ file: order.js:62 ~ createBuyOrder: ~ err:", err);
      return utilityFunc.sendErrorResponse(err, resp);
    }
  },
  getSellOrder: async (req, resp) => {
    try {
    } catch (err) {}
  },
  createBuyOrder: async (req, resp) => {
    try {
      let validationData = await utilityFunc.validationData(req.body, [
        "orderType",
        "fromCurrency",
        "toCurrency",
        "yourPrice",
        "paymentMethod",
        "paymentTimeLimit",
        "minOrderLimit",
        "maxOrderLimit",
        "buyerUPID",
      ]);
      if (validationData && validationData.status) {
        return utilityFunc.sendErrorResponse(validationData.error, resp);
      }

      // TDOD Code For Getting the Live Price for fromCurrent
      const price = await utilityFunc.getPrice(
        req.body.fromCurrency,
        req.body.toCurrency
      );
      console.log("🚀 ~ file: order.js:38 ~ createBuyOrder: ~ price:", price);

      const newOrder = await BuyOrder.create({
        userId: req.decode._id,
        orderType: req.body.orderType,
        fromCurrency: req.body.fromCurrency,
        toCurrency: req.body.toCurrency,
        yourPrice: req.body.yourPrice,
        initialPrice: req.body.yourPrice,
        highestPrice: req.body.highestPrice,
        priceType: req.body.priceType,
        paymentMethod: req.body.paymentMethod,
        paymentTimeLimit: req.body.paymentTimeLimit,
        minOrderLimit: req.body.minOrderLimit,
        maxOrderLimit: req.body.maxOrderLimit,
        terms: req.body.terms,
        autoReply: req.body.autoReply,
        counterPartyCondition: req.body.counterPartyCondition,
        orderStatus: req.body.orderStatus,
        buyerUPID: req.body.buyerUPID,
      });

      return utilityFunc.sendSuccessResponse(
        {
          message: "Order Created Successfully",
          data: {
            order: newOrder,
          },
        },
        resp
      );
    } catch (err) {
      console.log("🚀 ~ file: order.js:62 ~ createBuyOrder: ~ err:", err);
      return utilityFunc.sendErrorResponse(err, resp);
    }
  },
  createSellOrder: async (req, resp) => {
    try {
    } catch (err) {}
  },
};
