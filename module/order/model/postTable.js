const mongoose = require("mongoose");
let postTable = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "payment" },
    orderType: { type: String,enum:["BUY","SELL"], default: "" },
    asset: { type: String, default: "USDT" },
    withFiat: { type: String, default: "INR" },
    priceType: {
      type: String,
      enum: ["Fixed", "Float Price"],
      default: "Fixed",
    },
    yourPrice: { type: Number, default: 0 },
    highestOrderPrice: { type: Number, default: 0 },
    paymentMethod:{type:String,default:""},
    paymentTimeLimit:{type:String,default:""},
    totalAmount: { type: String, default: "" },
    available: { type: String, default: "" },
    minOrderLimit: { type: Number, default: 100 },
    maxOrderLimit: { type: Number, default: 2000000 },
    terms: { type: String, default: "" },
    autoReply: { type: String, default: "" },
    counterPartyCondition: { type: String, default: "" },
    buyersUPId: { type: String, default: "" },
    sellerUPId: { type: String, default: "" },
    postStatus: {
      type: String,
      enum: ["Published", "InProgress", "Pending", "Completed", "Cancelled"],
      default: "Published",
    },
  },
  { timestamp: true, versionKey: false }
);

module.exports = mongoose.model("postTable", postTable);

//TODO: If available < 0  postStatus Completed || available > 0 postStatus In Progress
