const mongoose = require("mongoose");
let SellOrderP2P = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "payment" },
    orderType: { type: String, default: "" },
    fromCurrency: { type: String, default: "" },
    toCurrency: { type: String, default: "" },
    yourPrice: { type: String, default: "" },
    initialPrice: { type: String, default: "" },
    availableBalance: { type: String, default: "" },
    highestOrderPrice: { type: String, default: "" },
    priceType: {
      type: String,
      enum: ["Fixed", "FloatPrice"],
      default: "Fixed",
    },
    paymentMethod: { type: String, default: "" },
    paymentTimeLimit: { type: String, default: "" },
    minOrderLimit: { type: String, default: "" },
    maxOrderLimit: { type: String, default: "" },
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
    sellerUPID: { type: String, default: "" },
  },
  { timestamp: true, versionKey: false }
);

module.exports = mongoose.model("SellOrderP2P", SellOrderP2P);
