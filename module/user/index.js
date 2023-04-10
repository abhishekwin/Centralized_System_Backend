const express = require("express");
const router = express.Router();
const userController = require("./controller/user");

const { userAuthentication } = require("../../utility/functions");

router.get("/", userController.register);

router.post('/createAccount', userController.createAccount);
router.post("/verify", userController.verifyAccount);
router.post("/verifOtp", userController.verifyOTP);
router.post("/login",userController.login);

router.post('/userKYC', userAuthentication,userController.userKYC);
router.post('/verifyKYC', userAuthentication,userController.adharSumitOtp);

router.post('/updateUser',userAuthentication, userController.updateUserProfile);
router.post('/updateEmailPhone',userAuthentication, userController.updateEmailPhone);
router.post('/forgotPassword', userController.forgotPassword);
router.post('/changePassword',userAuthentication, userController.changePassword);

module.exports = router;
