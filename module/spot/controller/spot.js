const spotTable = require("../model/spotTable");
const utilityFunc = require("../../../utility/functions");
const User = require("../../user/model/userTable");
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

      if (validationData && validationData.status) {
        throw new Error(validationData.error, resp);
      }

      const userDetails = await User.findOne({ _id: userData._id });

      if (userDetails.spotBalance <= 0) {
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

      if (req.body.spotOrderType === "LIMIT") {
        spotOrder = await spotTable.create({
          price: req.body.price,
        });
      } else if (req.body.spotOrderType === "MARKET") {
        spotOrder = await spotTable.create({
          price: await utilityFunc.getPrice(req.body.tradingPair, "usd"),
        });
      } else if (req.body.spotOrderType === "STOP_LOSS_LIMIT") {
        if (req.body.stop < req.body.price) {
          throw new Error("Stop limit exceeded than limit", resp);
        }

        spotOrder = await spotTable.create({
          stop: req.body.stop,
          price: req.body.price,
          quantity: req.body.quantity,
        });
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
    } catch (error) {
      return utilityFunc.sendErrorResponse(error, resp);
    }
  },
};
