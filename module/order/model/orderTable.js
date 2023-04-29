const mongoose = require("mongoose");

let sellUsdt = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    
    byCrypto: { type: String, default: "USDT" },
    withFiat: { type: String, default: "INR" },
    yourPrice: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    minOrderLimit: { type: Number, default: 0 },
    maxOrderLimit: { type: Number, default: 0 }, 
    paymentWindow: { type: Date, default: Date.now },
    terms: { type: String, default: "" },
    autoReply: { type: String, default: "" },
    counterPartyCondition: { type: String, default: "" },
    sellUsdtStatus: {
      type: String,
      enum: [
        "inProgress",
        "Payment Pending",
        "RequestSendedAmount",
        "RequestRecivedAmount",
        "PaymentCompleted",
        "orderCompleted",
        "Canceled"
      ],
      default: "inProgress",
    },
    sellerUpiId: { type: String, default: "" },
  },
  { timestamp: true, versionKey: false }
);
module.exports = mongoose.model("sellUsdt", sellUsdt);


// paymentStatus change