const mongoose = require("mongoose");

let BuyOrderP2P = mongoose.Schema({
  orderType: { type: String, default: "" },
  fromCurrency: { type: String, default: "" },
  toCurrency: { type: String, default: "" },
  yourPrice: { type: String, default: "" },
  highestOrderPrice: { type: String, default: "" },
  priceType: { type: String, default: "" },
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
  buyerUPID: { type: String, default: "" },
});



module.exports = mongoose.model("BuyOrderP2P", BuyOrderP2P);
