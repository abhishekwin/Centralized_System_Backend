const BuyOrder = require("../model/buyOrderTable");
const SellOrder = require("../model/sellOrderTable");
const utilityFunc = require("../../../utility/functions");

module.exports = {
  getBuyOrder: async (req, resp) => {
    try {
    } catch (err) {}
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
        return utilityFunc.sendErrorResponse(validationData.error, res);
      }

      // TDOD Code For Getting the Live Price for fromCurrent

      const newOrder = await BuyOrder.create({
        orderType: req.body.orderType,
        fromCurrency: req.body.fromCurrency,
        toCurrency: req.body.toCurrency,
        yourPrice: req.body.yourPrice,
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
          user: newOrder,
        },
        resp
      );
    } catch (err) {}
  },
  createSellOrder: async (req, resp) => {
    try {
    } catch (err) {}
  },
};
