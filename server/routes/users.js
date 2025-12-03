const express = require("express");
const { searchUsers } = require("../controllers/userControllers");
const router = express.Router();

router.get("/search", searchUsers)

module.exports = router;