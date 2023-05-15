const mongoose = require("mongoose");

const spotTable = mongoose.Schema({
  spotOrderCreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  time: { type: Date, default: Date.now() },
  spotOrderSide: { type: String, enum: ["BUY", "SELL"], default: "BUY" },
  tradingPair: { type: "String",enum:["ethereum","bitcoin"],default: "bitcoin" },
  spotOrderType: {
    type: String,
    enum: ["LIMIT", "MARKET", "STOP_LOSS_LIMIT"],
    default: "LIMIT",
  },
  filled: { type: Number, default: -1 },
  price: { type: Number, default: -1 },
  stop: { type: Number, default: -1 },
  quantity: { type: Number, default: -1 },
  spotOrderStatus: {
    type: String,
    enum: ["Null","Open", "Executed", "Cancelled"],
    default: "Null",
  },
  makerFee:{type:Number,default:0},
  takerFee:{type:Number,default:0},
});

module.exports = mongoose.model("spotTable", spotTable);
