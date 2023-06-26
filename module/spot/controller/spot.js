const spotTable = require("../model/spotTable");
const utilityFunc = require("../../../utility/functions");
const User = require("../../user/model/userTable");
const { $where } = require("../../message/model/messageTable");
const { request } = require("express");
const ObjectId = require("objectid");

// Initialize the order book
let orderBook = {
  buyOrders: [],
  sellOrders: [],
};
module.exports = {
  // createSpotOrder: async (req, resp) => {
  //   try {
  //     let userData = req.decode;
  //     let validationData = await utilityFunc.validationData(req.body, [
  //       "quantity",
  //       "spotOrderSide",
  //       "tradingPair",
  //       "price",
  //       "stop",
  //       "spotOrderType",
  //     ]);
  //     console.log(
  //       "🚀 ~ file: spot.js:17 ~ createSpotOrder: ~ validationData:",
  //       validationData
  //     );

  //     if (validationData && validationData.status) {
  //       console.log(
  //         "🚀 ~ file: spot.js:20 ~ createSpotOrder: ~ validationData && validationData.status:",
  //         validationData && validationData.status
  //       );
  //       throw new Error(validationData.error, resp);
  //     }

  //     const userDetails = await User.findOne({ _id: userData._id });
  //     console.log(
  //       "🚀 ~ file: spot.js:25 ~ createSpotOrder: ~ userDetails:",
  //       userDetails
  //     );

  //     if ((userDetails.spotBalance = 0)) {
  //       throw new Error(validationData.error, resp);
  //     }

  //     let spotOrder = await spotTable.create({
  //       spotOrderCreatedBy: userData._id,
  //       time: Date.now(),
  //       spotOrderSide: req.body.spotOrderSide,
  //       tradingPair: req.body.tradingPair,
  //       spotOrderType: req.body.spotOrderType,
  //       spotOrderStatus: "Open",
  //     });
  //     console.log(
  //       "🚀 ~ file: spot.js:39 ~ createSpotOrder: ~ spotOrder:",
  //       spotOrder
  //     );

  //     if (req.body.spotOrderType === "LIMIT") {
  //       spotOrder = await spotTable.findOneAndUpdate(
  //         { spotOrderCreatedBy: userData._id },
  //         { $set: { price: req.body.price } },
  //         { new: true }
  //       );
  //     } else if (req.body.spotOrderType === "MARKET") {
  //       response = await utilityFunc.getPrice(req.body.tradingPair, "usd");
  //       let newPrice = 0;
  //       if (response[`${req.body.tradingPair}`].usd) {
  //         newPrice = response[`${req.body.tradingPair}`]["usd"];
  //         console.log(
  //           "🚀 ~ file: spot.js:56 ~ createSpotOrder: ~ response[`${req.body.tradingPair}`].usd:",
  //           response[`${req.body.tradingPair}`].usd
  //         );
  //         spotOrder = await spotTable.findOneAndUpdate(
  //           { spotOrderCreatedBy: userData._id },
  //           { $set: { price: newPrice } },
  //           { new: true }
  //         );
  //         console.log(
  //           "🚀 ~ file: spot.js:64 ~ createSpotOrder: ~ spotOrder:",
  //           spotOrder
  //         );
  //       } else if (req.body.spotOrderType === "STOP_LOSS_LIMIT") {
  //         if (req.body.stop < req.body.price) {
  //           throw new Error("Stop limit exceeded than limit", resp);
  //         }

  //         spotOrder = await spotTable.findOneAndUpdate(
  //           { spotOrderCreatedBy: userData._id },
  //           {
  //             $set: {
  //               stop: req.body.stop,
  //               price: req.body.price,
  //               quantity: req.body.quantity,
  //             },
  //           },
  //           { new: true }
  //         );
  //       } else {
  //         throw new Error("Invalid Spot Order Type", resp);
  //       }

  //       return utilityFunc.sendSuccessResponse(
  //         {
  //           data: {
  //             message: "Spot Order Created Successfully",
  //             spotOrderDetails: spotOrder,
  //           },
  //         },
  //         resp
  //       );
  //     }
  //   } catch (error) {
  //     return utilityFunc.sendErrorResponse(error, resp);
  //   }
  // },
  // createOrder: async (req, resp) => {
  //   try {
  //     let data = req.decode;
  //     let validationData = await utilityFunc.validationData(req.body, [
  //       "side",
  //       "price",
  //       "quantity",
  //     ]);
  //     if (validationData && validationData.status) {
  //       throw new Error(validationData.error, resp);
  //     }

  //     const order = {
  //       // id: generateOrderId(),
  //       side: req.body.side,
  //       price: req.body.price,
  //       quantity: req.body.quantity,
  //     };

  //     if (order.side === "buy") {
  //       orderBook.buyOrders.push(order);
  //     } else if (order.side === "sell") {
  //       orderBook.sellOrders.push(order);
  //     } else {
  //       throw new Error("Invalid Side", resp);
  //     }

  //     return utilityFunc.sendSuccessResponse({
  //       data: {
  //         messsage: "Spot order placed successfully",
  //         orderDetails: order,
  //       },
  //     });
  //   } catch (error) {
  //     return utilityFunc.sendErrorResponse(error, resp);
  //   }
  // },

  createOrder: async (req, resp) => {
    try {
      const data = req.decode;

      let details = data._id;
      console.log(
        "🚀 ~ file: spot.js:161 ~ createOrder: ~ details:",
        typeof details
      );

      let validationData = await utilityFunc.validationData(req.body, [
        "side",
        "price",
        "quantity",
        "buyCurrency",
        "sellCurrency",
      ]);

      if (validationData && validationData.status) {
        throw new Error(validationData.error, resp);
      }

      if (data.spotBalance > req.body.quantity) {
        throw new Error(validationData.error, resp);
      }

      const order = {
        // id: generateOrderId(),
        side: req.body.side,
        price: req.body.price,
        quantity: req.body.quantity,
        buyCurrency: req.body.buyCurrency,
        sellCurrency: req.body.sellCurrency,
      };

      if (order.side === "buy") {
        // Match buy order with sell orders
        let matchedOrders = [];
        console.log(
          "🚀 ~ file: spot.js:195 ~ createOrder: ~ matchedOrders:",
          matchedOrders
        );
        for (let i = 0; i < orderBook.sellOrders.length; i++) {
          const sellOrder = orderBook.sellOrders[i];
          if (sellOrder.price <= order.price) {
            // Execute trade logic
            const transactionPrice = Math.min(sellOrder.price, order.price);
            const transactionQuantity = Math.min(
              sellOrder.quantity,
              order.quantity
            );
            // Update quantities
            sellOrder.quantity -= transactionQuantity;
            order.quantity -= transactionQuantity;
            // Add matched order details to the response
            matchedOrders.push({
              sellOrderId: sellOrder.id, // assuming sellOrder has an "id" property
              transactionPrice,
              transactionQuantity,
            });
            // Remove the sell order if it has been completely filled
            if (sellOrder.quantity === 0) {
              console.log("Removing sell order:", sellOrder.id);
              orderBook.sellOrders.splice(i, 1);
              i--; // decrement i to account for the removed sell order
            }
            // Exit the loop if the buy order has been completely filled
            if (order.quantity === 0) {
              console.log("Buy order completely filled.");
              break;
            }
          }
        }
        // Add the buy order to the order book if there is remaining quantity
        if (order.quantity > 0) {
          console.log("Adding buy order:", order);
          orderBook.buyOrders.push(order);
        }

        let userDetails, currentBalance;
        currentBalance = await User.findById({ _id: ObjectId(data._id) }); //Current Details
        console.log(
          "🚀 ~ file: spot.js:234 ~ createOrder: ~ currentBalance:",
          currentBalance
        );
        //console.log("🚀 ~ file: spot.js:230 ~ createOrder: ~ User:", User);

        if (
          req.body.buyCurrency === "spotCurrency" &&
          req.body.sellCurrency === "spotBalance"
        ) {
          if (req.body.quantity > currentBalance.spotBalance) {
            throw new Error("Amount is greater than spot Balance", resp);
          }
          userDetails = await User.findByIdAndUpdate(
            { _id: ObjectId(data._id) },
            {
              $set: {
                spotBalance: currentBalance.spotBalance - req.body.quantity,
                spotCurrency: currentBalance.spotCurrency + req.body.quantity,
              },
            },
            { new: true }
          );
          console.log(
            "🚀 ~ file: spot.js:246 ~ createOrder: ~ userDetails:",
            userDetails
          );
        } else if (
          req.body.buyCurrency === "spotCurrency" &&
          req.body.sellCurrency === "spotBalance"
        ) {
          if (req.body.quantity > currentBalance.spotBalance) {
            throw new Error("Amount is greater than spot Balance", resp);
          }
          userDetails = await User.findByIdAndUpdate(
            { _id: data.spotBalance },
            {
              $set: {
                spotCurrency: currentBalance.spotCurrency - req.body.quantity,
                spotBalance: currentBalance.spotBalance + req.body.quantity,
              },
            },
            { new: true }
          );
        }

        return utilityFunc.sendSuccessResponse(
          {
            data: {
              messsage: "Spot order executed successfully",
              orderDetails: {
                ...order,
                matchedOrders,
              },
            },
          },
          resp
        );
      } else if (order.side === "sell") {
        // Match sell order with buy orders
        let matchedOrders = [];
        for (let i = 0; i < orderBook.buyOrders.length; i++) {
          const buyOrder = orderBook.buyOrders[i];
          if (buyOrder.price >= order.price) {
            // Execute trade logic
            const transactionPrice = Math.max(buyOrder.price, order.price);
            const transactionQuantity = Math.min(
              buyOrder.quantity,
              order.quantity
            );
            // Update quantities
            buyOrder.quantity -= transactionQuantity;
            order.quantity -= transactionQuantity;
            // Add matched order details to the response
            matchedOrders.push({
              buyOrderId: buyOrder.id, // assuming buyOrder has an "id" property
              transactionPrice,
              transactionQuantity,
            });
            // Remove the buy order if it has been completely filled
            if (buyOrder.quantity === 0) {
              console.log("Removing buy order:", buyOrder.id);
              orderBook.buyOrders.splice(i, 1);
              i--; // decrement i to account for the removed buy order
            }
            // Exit the loop if the sell order has been completely filled
            if (order.quantity === 0) {
              console.log("Sell order completely filled.");
              break;
            }
          }
        }
        // Add the sell order to the order book if there is remaining quantity
        if (order.quantity > 0) {
          console.log("Adding sell order:", order);
          orderBook.sellOrders.push(order);
        }
        return utilityFunc.sendSuccessResponse(
          {
            data: {
              messsage: "Spot order placed successfully",
              orderDetails: {
                ...order,
                matchedOrders,
              },
            },
          },
          resp
        );
      } else {
        throw new Error("Invalid Side", resp);
      }
    } catch (error) {
      console.log("Error:", error);
      return utilityFunc.sendErrorResponse(error, resp);
    }
  },

  getOrderBook: async (req, resp) => {
    try {
      let userData = req.decode;
      console.log(
        "🚀 ~ file: spot.js:121 ~ getOrderBook: ~ userData:",
        userData
      );
      const orderId = req.params.id;
      console.log("🚀 ~ file: spot.js:123 ~ getOrderBook: ~ orderId:", orderId);
      return utilityFunc.sendSuccessResponse(
        {
          data: {
            message: "OrderBook display",
            data: orderBook,
          },
        },
        resp
      );
    } catch (error) {
      return utilityFunc.sendErrorResponse(error, resp);
    }
  },
};
