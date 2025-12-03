const express = require("express");
const { 
  createDirectChat, 
  createGroupChat 
} = require("../controllers/roomControllers");
const router = express.Router();

// Direct chat (1-on-1)
router.post("/direct", createDirectChat);

// Group chat (3+ members)
router.post("/group", createGroupChat);

module.exports = router;