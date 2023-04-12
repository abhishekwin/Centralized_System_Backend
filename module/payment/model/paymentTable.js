const mongoose = require("mongoose");

let paymentSchema = mongoose.Schema(
  {
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: { type: String, default: "" },
    upiId: { type: String, default: "" },
    qrcode: { type: String, default: "" },
    status: { type: Boolean, default: true },
    publicIp:{type: Boolean, default: ""},
    amount: {type: Number, default: 0}
  },
  { timestamp: true, versionKey: false }
);

const Payment = (module.exports = mongoose.model("Payment", paymentSchema));
