const express = require("express");
const router = express.Router();
const { userAuthentication } = require("../../utility/functions");
const spotController = require("./controller/spot");

router.post("/createSpotOrder", userAuthentication, spotController.createSpotOrder);
module.exports = router;
