const sellOrder = require("../model/orderTable");
const utilityFunc = require("../../../utility/functions");
const { default: axios } = require("axios");

module.exports = {
  sellUsdt: async (req, res) => {
    try {
      data = req.decode;
      console.log("🚀 ~ file: order.js:9 ~ sellUsdt: ~ data:", data);
      let validationData = await utilityFunc.validationData(req.body, [
        // "byCrypto",
        // "withFiat",
        "amount",
        "orderId",
      ]);
      console.log(
        "🚀 ~ file: order.js:18 ~ sellUsdt: ~ validationData:",
        validationData
      );

      if (validationData && validationData.status) {
        console.log(
          "🚀 ~ file: order.js:19 ~ sellUsdt: ~ validationData && validationData.status:",
          validationData && validationData.status
        );
        return utilityFunc.validationData(validationData.error, res);
      }

      const FundingWallet = await utilityFunc.getBalance(
        req.decode.cryptoAddress
      );
      console.log(
        "🚀 ~ file: order.js:26 ~ sellUsdt: ~ FundingWallet:",
        FundingWallet
      );

      if (FundingWallet < req.body.amount) {
        console.log(
          "🚀 ~ file: order.js:38 ~ sellUsdt: ~ FundingWallet < req.body.amount:",
          FundingWallet + " and " + req.body.amount
        );
        return utilityFunc.sendErrorResponse(validationData.error, res);
      }

      const p2pSellUsdt = await sellOrder.create({
        byCrypto: req.body.byCrypto,
        withFiat: req.body.withFiat,
        yourPrice: req.body.yourPrice,
        amount: req.body.amount,
        sellUsdtStatus: req.body.sellUsdtStatus,
      });
      console.log(
        "🚀 ~ file: order.js:50 ~ sellUsdt: ~ p2pSellUsdt:",
        p2pSellUsdt
      );

      return utilityFunc.sendSuccessResponse(
        {
          message: "Sell Usdt Successfully",
          data: p2pSellUsdt,
        },
        res
      );
    } catch (error) {
      console.log("🚀 ~ file: order.js:57 ~ sell: ~ error:", error);
      return utilityFunc.sendErrorResponse(
        { message: "Insufficient funds in wallet" },
        res
    );    }
  },

  updateOrderStatusForSellUsdt: async (req, res) => {
    try {
      data = req.decode;
      let validationData = await utilityFunc.validationData(req.body, [
        "orderId",
        "orderStatus",
      ]);

      if (validationData && validationData.status) {
        console.log(
          "🚀 ~ file: order.js:19 ~ sellUsdt: ~ validationData && validationData.status:",
          validationData && validationData.status
        );
        return utilityFunc.validationData(validationData.error, res);
      }
    } catch (error) {}
  },
};
