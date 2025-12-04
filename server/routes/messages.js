const express = require("express");
const { sendMessage, getMessages } = require("../controllers/messageControllers");
const router = express.Router();

// Protected message route
router.post("/", sendMessage);
router.get("/:roomId", getMessages);

module.exports = router;