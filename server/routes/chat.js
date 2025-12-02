const express = require("express");
const { getChats } = require("../controllers/chatControllers");
const router = express.Router();

// get chats api
router.get("/chats", getChats);

module.exports = router;
