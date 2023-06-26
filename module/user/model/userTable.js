const mongoose = require("mongoose");

let userSchema = mongoose.Schema(
  {
    email: { type: String, default: "" },
    password: { type: String, default: "" },
    phoneNumber: { type: Number, default: 0 },
    countryCode: { type: String, default: "" },
    googleId: { type: String, default: "" },
    facebookId: { type: String, default: "" },
    OTP: { type: String, default: "" },
    socketId: { type: String, default: "" },
    online: { type: String, default: "OffLine", enum: ["OnLine", "OffLine"] },
    fireBaseId: { type: String, default: "" },
    pancardNo: { type: String, default: "" },
    aadharCardNo: { type: String, default: "" },
    kycDetail: { type: Object, default: {} },
    kycOTP: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isKYCDone: { type: Boolean, default: false },
    token: { type: String, default: "" }, //auth
    cryptoAddress: { type: String, default: "" }, //walletAddress
    wId: { type: String, default: "" }, //walletId
    fundingBalance: { type: Number, default: 0 },
    spotBalance: { type: Number, default: 0 },
    spotCurrency: [
      { Name: { type: String, default: "" } },
      { Number: { type: Number, default: 0 } },
    ],
    status: { type: Boolean, default: false },
    address: {
      userName: { type: String, default: "" },
      nationality: { type: String, default: "" },
      dateOfBirth: { type: String, default: "" },
      fullAddress: { type: String, default: "" },
      pinCode: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "" },
    },
  },
  {
    timestamp: true,
    versionKey: false, // You should be aware of the outcome after set to false
  }
);

const User = (module.exports = mongoose.model("User", userSchema));

// TODO: Add Funding & Spot Wallet Key and Create API For Conversion From Funding to Spot Wallet and Vice Versa
// TODO: Rename balance to Funding wallet in all place
