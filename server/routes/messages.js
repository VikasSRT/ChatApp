const express = require("express");
const { sendMessage } = require("../controllers/messageControllers");
const router = express.Router();

// Protected message route
router.post("/", sendMessage);

module.exports = router;