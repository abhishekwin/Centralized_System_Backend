const mongoose = require("mongoose");
let orderTable = mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "postTable" },
  postedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  orderCreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  cryptoBuyUser: { type: String, default: "" },
  cryptoSellUser: { type: String, default: "" },
  amount: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  paymentMethod: { type: String, default: "" },
  orderStatus: {
    type: String,
    enum: [
      "OrderNotCreated",
      "OrderCreated",
      "OrderPending",
      "OrderCompleted",
      "NotifiyBuyerMoneySent",
      "NotifiySellerMoneySent",
      "PaymentSentBuyer",
      "PaymentSentSeller",
      "Cancelled",
      "Pending",
    ],
    default: "OrderNotCreated",
  },
  buyerUPID: { type: String, default: "" },
  sellerUPID: { type: String, default: "" },
});

module.exports = mongoose.model("OrderTable", orderTable);
