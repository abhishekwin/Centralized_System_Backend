// const BuyOrder = require("../model/buyPostTable");
// const SellOrder = require("../model/sellPostTable");
const PostTable = require("../model/postTable");
const utilityFunc = require("../../../utility/functions");
const ObjectId = require("objectid");

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
      let findQuerry = { orderStatus: "Published", orderType: "BUY" };
      if (req.body.filterName === "amount" && req.body.filterValue != "") {
        findQuerry.minOrderLimit = req.body.filterValue;
        console.log("At Line 20 API");
      }
      console.log(
        "🚀 ~ file: order.js:21 ~ getBuyPosts: ~ findQuerry:",
        findQuerry
      );
      const orderDetails = await PostTable.find(findQuerry)
        .skip((Number(req.body.pageNumber) - 1) * 10)
        .limit(10);
      console.log(
        "🚀 ~ file: order.js:24 ~ getBuyPosts: ~ orderDetails:",
        orderDetails
      );
      const orderDetailsCount = await PostTable.find(findQuerry).count();
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
      console.log(
        "🚀 ~ file: order.js:72 ~ getSellPosts: ~ validationData:",
        validationData
      );

      if (validationData && validationData.status) {
        console.log("Inside If Line 75");
        return utilityFunc.sendErrorResponse(
          { message: validationData.error },
          resp
        );
      }
      let findQuerry = { orderStatus: "Published", orderType: "SELL" };

      console.log(
        "🚀 ~ file: order.js:83 ~ getSellPosts: ~ findQuerry:",
        findQuerry
      );
      if (req.body.filterName === "amount" && req.body.filterValue != "") {
        console.log(`Inside Filter If Line 85`);
        findQuerry.minOrderLimit = req.body.filterValue;
      }

      const orderDetails = await PostTable.find(findQuerry)
        .skip((Number(req.body.pageNumber) - 1) * 10)
        .limit(10);
      console.log(
        "🚀 ~ file: order.js:92 ~ getSellPosts: ~ orderDetails:",
        orderDetails
      );

      const orderDetailsCount = await PostTable.find(findQuerry).count();
      console.log(
        "🚀 ~ file: order.js:95 ~ getSellPosts: ~ orderDetailsCount:",
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
  createBuyPost: async (req, resp) => {
    try {
      let validationData = await utilityFunc.validationData(req.body, [
        "orderType",
        "asset",
        "withFiat",
        "priceType",
        "yourPrice",
        "totalAmount",
        "minOrderLimit",
        "maxOrderLimit",
        "paymentMethod",
        "paymentTimeLimit",
        "terms",
        "buyerUPId",
      ]);
      if (validationData && validationData.status) {
        throw new Error("Invalid Validation Data");
      }

      const balance = await utilityFunc.getBalance(req.decode.cryptoAddress);
      console.log(
        "🚀 ~ file: order.js:101 ~ createBuyPost: ~ balance:",
        balance
      );
      const {
        tether: { inr },
      } = await utilityFunc.getPrice(req.body.asset, req.body.withFiat);
      console.log("🚀 ~ file: order.js:38 ~ createBuyOrder: ~ price:", inr);

      if (balance < req.body.totalAmount) {
        throw new Error("Insufficient Balance");
      }
      const newOrder = await PostTable.create({
        userId: req.decode._id,
        orderType: req.body.orderType,
        asset: req.body.asset,
        withFiat: req.body.withFiat,
        yourPrice: req.body.yourPrice,
        available: req.body.totalAmount,
        highestPrice: req.body.highestPrice,
        priceType: req.body.priceType,
        paymentMethod: req.body.paymentMethod,
        paymentTimeLimit: req.body.paymentTimeLimit,
        minOrderLimit: req.body.minOrderLimit,
        maxOrderLimit: req.body.maxOrderLimit,
        terms: req.body.terms,
        autoReply: req.body.autoReply,
        counterPartyCondition: req.body.counterPartyCondition,
        postStatus: req.body.orderStatus,
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
  getPostById: async (req, resp) => {
    try {
      let querryData = req.params;
      console.log("querydata ===> ", querryData);
      if (!querryData.id) {
        throw new Error("Order id is Required!");
      }
      const orderDeatils = await PostTable.findOne({
        _id: ObjectId(querryData.id),
      }).populate("userId");
      return utilityFunc.sendSuccessResponse(
        {
          message: "get Order detail by id success",
          data: orderDeatils,
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
        "asset",
        "withFiat",
        "priceType",
        "yourPrice",
        "minOrderLimit",
        "maxOrderLimit",
        "paymentMethod",
        "totalAmount",
        "paymentTimeLimit",
        "terms",
        "sellerUPId",
      ]);
      console.log(
        "🚀 ~ file: posts.js:232 ~ createSellPost: ~ validationData:",
        validationData
      );
      if (validationData && validationData.status) {
        throw new Error("Invalid Validation Data");
      }

      const balance = await utilityFunc.getBalance(req.decode.cryptoAddress);
      console.log(
        "🚀 ~ file: order.js:101 ~ createBuyPost: ~ balance:",
        balance
      );
      const {
        tether: { inr },
      } = await utilityFunc.getPrice(req.body.asset, req.body.withFiat);
      console.log("🚀 ~ file: order.js:38 ~ createBuyOrder: ~ price:", inr);

      if (balance < req.body.totalAmount) {
        throw new Error("Insufficient Balance");
      }
      const newOrder = await PostTable.create({
        userId: req.decode._id,
        orderType: req.body.orderType,
        asset: req.body.asset,
        withFiat: req.body.withFiat,
        yourPrice: req.body.yourPrice,
        available: req.body.totalAmount,
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
        sellerUPId: req.body.sellerUPId,
      });

      return utilityFunc.sendSuccessResponse(
        {
          message: "Sell Post Created Successfully",
          data: newOrder,
        },
        resp
      );
    } catch (err) {
      console.log("🚀 ~ file: order.js:62 ~ createBuyOrder: ~ err:", err);
      return utilityFunc.sendErrorResponse(err, resp);
    }
  },
};
