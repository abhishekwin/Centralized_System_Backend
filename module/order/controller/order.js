const BuyOrder = require("../model/buyOrderTable");
const SellOrder = require("../model/sellOrderTable");
const utilityFunc = require("../../../utility/functions");
const { default: axios } = require("axios");

module.exports = {
  getBuyPosts: async (req, resp) => {
    try {
      let validationData = await utilityFunc.validationData(req.body, [
        "pageNumber",
        "filterName",
        "filterValue",
      ]);
      console.log(
        "🚀 ~ file: order.js:14 ~ getBuyPosts: ~ validationData:",
        validationData
      );
      if (validationData && validationData.status) {
        console.log("Inside IF Validation Data is not valids");
        return utilityFunc.sendErrorResponse(
          { message: validationData.error },
          resp
        );
      }
      let findQuerry = { orderStatus: "Published" };
      if (req.body.filterName === "amount" && req.body.filterValue != "") {
        findQuerry.minOrderLimit = req.body.filterValue;
        console.log("At Line 20 API");
      }
      console.log(
        "🚀 ~ file: order.js:21 ~ getBuyPosts: ~ findQuerry:",
        findQuerry
      );
      const orderDetails = await BuyOrder.find(findQuerry)
        .skip((Number(req.body.pageNumber) - 1) * 10)
        .limit(10);
      console.log(
        "🚀 ~ file: order.js:24 ~ getBuyPosts: ~ orderDetails:",
        orderDetails
      );
      const orderDetailsCount = await BuyOrder.find(findQuerry).count();
      console.log(
        "🚀 ~ file: order.js:26 ~ getBuyPosts: ~ orderDetailsCount:",
        orderDetailsCount
      );
      if (!orderDetails) {
        return utilityFunc.sendErrorResponse(
          { message: "Order Not Found", data: {} },
          resp
        );
      }
      return utilityFunc.sendSuccessResponseWithCount(
        {
          message: "Order Details",
          data: orderDetails,
        },
        orderDetailsCount,
        resp
      );
    } catch (err) {
      console.log("🚀 ~ file: order.js:62 ~ createBuyOrder: ~ err:", err);
      return utilityFunc.sendErrorResponse(err, resp);
    }
  },
  getSellPosts: async (req, resp) => {
    try {
      let validationData = await utilityFunc.validationData(req.body, [
        "pageNumber",
        "filterName",
        "filterValue",
      ]);

      if (validationData && validationData.status) {
        return utilityFunc.sendErrorResponse(
          { message: validationData.error },
          resp
        );
      }
      let findQuerry = { orderStatus: "Published" };
      if (req.body.filterName === "amount" && req.body.filterValue != "") {
        findQuerry.minOrderLimit = req.body.filterValue;
      }

      const orderDetails = await SellOrder.find(findQuerry)
        .skip((Number(req.body.pageNumber) - 1) * 10)
        .limit(10);
      const orderDetailsCount = await SellOrder.find(findQuerry).count();
      if (!orderDetails) {
        return utilityFunc.sendErrorResponse(
          { message: "Order Not Found", data: {} },
          resp
        );
      }
      return utilityFunc.sendSuccessResponseWithCount(
        {
          message: "Order Details",
          data: orderDetails,
        },
        orderDetailsCount,
        resp
      );
    } catch (err) {
      console.log("🚀 ~ file: order.js:62 ~ createBuyOrder: ~ err:", err);
      return utilityFunc.sendErrorResponse(err, resp);
    }
  },
  createBuyPost: async (req, resp) => {
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

      const balance = await utilityFunc.getBalance(req.decode.cryptoAddress);
      console.log(
        "🚀 ~ file: order.js:101 ~ createBuyPost: ~ balance:",
        balance
      );
      const price = await utilityFunc.getPrice(
        req.body.fromCurrency,
        req.body.toCurrency
      );
      console.log("🚀 ~ file: order.js:38 ~ createBuyOrder: ~ price:", price);

      if (balance < req.body.totalAmount) {
        return utilityFunc.sendErrorResponse(
          { message: "Insufficient Balance" },
          resp
        );
      }
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
          message: "Buy Order Created Successfully",
          data: newOrder,
        },
        resp
      );
    } catch (err) {
      console.log("🚀 ~ file: order.js:62 ~ createBuyOrder: ~ err:", err);
      return utilityFunc.sendErrorResponse(err, resp);
    }
  },
  createSellPost: async (req, resp) => {
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

      const balance = await utilityFunc.getBalance(req.decode.cryptoAddress);
      console.log(
        "🚀 ~ file: order.js:101 ~ createBuyPost: ~ balance:",
        balance
      );
      const price = await utilityFunc.getPrice(
        req.body.fromCurrency,
        req.body.toCurrency
      );
      console.log("🚀 ~ file: order.js:199 ~ createSellPost: ~ price:", price);

      if (balance < req.body.totalAmount) {
        return utilityFunc.sendErrorResponse(
          { message: "Insufficient Balance" },
          resp
        );
      }
      const newOrder = await SellOrder.create({
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
          message: "Sell Order Created Successfully",
          data: newOrder,
        },
        resp
      );
    } catch (err) {}
  },
};
