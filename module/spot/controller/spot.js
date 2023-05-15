const spotTable = require("../model/spotTable");
const utilityFunc = require("../../../utility/functions");
const User = require("../../user/model/userTable");
const ObjectId = require('objectid'); 
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
        console.log(`Inside Validation: ${validationData.status}`);
        throw new Error(validationData.error, resp);
      }

      const userDetails = await User.findOne({ _id: userData._id });
      console.log(
        "🚀 ~ file: spot.js:23 ~ createSpotOrder: ~ userDetails:",
        userDetails
      );

      if (userDetails.spotBalance <= 0) {
        console.log("Spot Balance is 0");
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
        "🚀 ~ file: spot.js:38 ~ createSpotOrder: ~ spotOrder:",
        spotOrder
      );

      if (req.body.spotOrderType === "LIMIT") {
        console.log(`Inside LIMIT Order`);
        spotOrder = await spotTable.findOneAndUpdate(
          { spotOrderCreatedBy: userData._id },
          { $set: { price: req.body.price } },
          { new: true }
        );
      } else if (req.body.spotOrderType === "MARKET") {
        const response = await utilityFunc.getPrice(
          req.body.tradingPair,
          "usd"
        );
        let newprice = 0;
        if (response[`${req.body.tradingPair}`].usd) {
          newprice = response[`${req.body.tradingPair}`]["usd"];
        }
        spotOrder = await spotTable.findOneAndUpdate(
          { spotOrderCreatedBy: userData._id },
          {
            $set: {
              price: newprice,
            },
          },
          { new: true }
        );
      } else if (req.body.spotOrderType === "STOP_LOSS_LIMIT") {
        console.log(`Inside STOP_LOSS_LIMIT`);
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
    } catch (error) {
      return utilityFunc.sendErrorResponse(error, resp);
    }
  },
  getSportOrderById: async (req, resp) => {
    try {
      const spotOrderId = req.params.id;
      if (!spotOrderId) {
        throw new Error("Spot Order Id is required");
      }
      const orderDeatils = await spotTable.findOne({
        _id: ObjectId(spotOrderId),
      });

      return utilityFunc.sendSuccessResponse({
        data: {
          message: "get spot order",
          spotOrderDetails: orderDeatils,
        },
      },resp);
    } catch (error) {
      return utilityFunc.sendErrorResponse(error, resp);
    }
  },
};
