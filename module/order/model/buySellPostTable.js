const mongoose = require("mongoose");

let PostAdP2P = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    postType: { type: String, enum: ["Buy", "Sell"], default: "" },
    asset: { type: String, default: "USDT" },
    withFiat: { type: String, default: "INR" },
    yourPrice: { type: Number, default: 0 },
    highestOrderPrice: { type: Number, default: 0 },
    lowestOrderPrice: { type: Number, default: 0 },
    priceType: {
      type: String,
      enum: ["Fixed", "FloatPrice"],
      default: "Fixed",
    },
    totalAmount: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    minOrderLimit: { type: Number, default: 0 },
    maxOrderLimit: { type: Number, default: 0 },    paymentTimeLimit: { type: Date, default: Date.now },
    terms: { type: String, default: "" },
    autoReply: { type: String, default: "" },
    counterPartyCondition: { type: String, default: "" },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Completed",
        "Canceled",
        "Published",
        "Unpublished",
        "Payment Done",
        "Payment Pending",
      ],
      default: "Unpublished",
    },
    sellerUpiId: { type: String, default: "" },
    buyerUpiId: { type: String, default: "" },

  },
  { timestamp: true, versionKey: false }
);
module.exports = mongoose.model("PostAdP2P", PostAdP2P);
