const express = require("express");
const {
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
} = require("../controllers/messageControllers");
const router = express.Router();

// Protected message route
router.post("/", sendMessage);
router.delete("/:messageId", deleteMessage);
router.get("/:roomId", getMessages);
router.put("/:messageId", editMessage);

module.exports = router;
