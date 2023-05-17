const spotTable = require("../model/spotTable");
const utilityFunc = require("../../../utility/functions");
const User = require("../../user/model/userTable");
const { $where } = require("../../message/model/messageTable");
module.exports = {
  createSpotOrder: async (req, resp) => {
    try {
      let userData = req.decode;
      let validationData = await utilityFunc.validationData(req.body, [
        "quantity",
        "spotOrderSide",
        "tradingPair",
        "price",
        "stop",
        "spotOrderType",
      ]);
      console.log(
        "🚀 ~ file: spot.js:17 ~ createSpotOrder: ~ validationData:",
        validationData
      );

      if (validationData && validationData.status) {
        console.log(
          "🚀 ~ file: spot.js:20 ~ createSpotOrder: ~ validationData && validationData.status:",
          validationData && validationData.status
        );
        throw new Error(validationData.error, resp);
      }

      const userDetails = await User.findOne({ _id: userData._id });
      console.log(
        "🚀 ~ file: spot.js:25 ~ createSpotOrder: ~ userDetails:",
        userDetails
      );

      if ((userDetails.spotBalance = 0)) {
        throw new Error(validationData.error, resp);
      }

      let spotOrder = await spotTable.create({
        spotOrderCreatedBy: userData._id,
        time: Date.now(),
        spotOrderSide: req.body.spotOrderSide,
        tradingPair: req.body.tradingPair,
        spotOrderType: req.body.spotOrderType,
        spotOrderStatus: "Open",
      });
      console.log(
        "🚀 ~ file: spot.js:39 ~ createSpotOrder: ~ spotOrder:",
        spotOrder
      );

      if (req.body.spotOrderType === "LIMIT") {
        spotOrder = await spotTable.findOneAndUpdate(
          { spotOrderCreatedBy: userData._id },
          { $set: { price: req.body.price } },
          { new: true }
        );
      } else if (req.body.spotOrderType === "MARKET") {
        response = await utilityFunc.getPrice(req.body.tradingPair, "usd");
        let newPrice = 0;
        if (response[`${req.body.tradingPair}`].usd) {
          newPrice = response[`${req.body.tradingPair}`]["usd"];
          console.log(
            "🚀 ~ file: spot.js:56 ~ createSpotOrder: ~ response[`${req.body.tradingPair}`].usd:",
            response[`${req.body.tradingPair}`].usd
          );
          spotOrder = await spotTable.findOneAndUpdate(
            { spotOrderCreatedBy: userData._id },
            { $set: { price: newPrice } },
            { new: true }
          );
          console.log(
            "🚀 ~ file: spot.js:64 ~ createSpotOrder: ~ spotOrder:",
            spotOrder
          );
        } else if (req.body.spotOrderType === "STOP_LOSS_LIMIT") {
          if (req.body.stop < req.body.price) {
            throw new Error("Stop limit exceeded than limit", resp);
          }

          spotOrder = await spotTable.findOneAndUpdate(
            { spotOrderCreatedBy: userData._id },
            {
              $set: {
                stop: req.body.stop,
                price: req.body.price,
                quantity: req.body.quantity,
              },
            },
            { new: true }
          );
        } else {
          throw new Error("Invalid Spot Order Type", resp);
        }

        return utilityFunc.sendSuccessResponse(
          {
            data: {
              message: "Spot Order Created Successfully",
              spotOrderDetails: spotOrder,
            },
          },
          resp
        );
      }
    } catch (error) {
      return utilityFunc.sendErrorResponse(error, resp);
    }
  },
};
