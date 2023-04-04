const mongoose = require("mongoose");

let paymentSchema = mongoose.Schema(
  {
    userId: { type: String, default: "" },
    name: { type: String, default: "" },
    upiId: { type: String, default: "" },
    qrcode: { type: String, default: "" },
    status: { type: Boolean, default: true },
  },
  { timestamp: true, versionKey: false }
);

const Payment = (module.exports = mongoose.model("Payment", paymentSchema));
