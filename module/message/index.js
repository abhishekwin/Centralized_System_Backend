const express = require("express");
const router = express.Router();
const Authentication = require("../../utility/functions");
const postController = require("./controller/chat");

//@desc API for chat intrection between buyer an seller using this API
//@route chatBot/chat
//@access private
router.post("/message", Authentication.userAuthentication, postController.getAllMessage);

module.exports = router;

