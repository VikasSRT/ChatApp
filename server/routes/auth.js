const express = require("express");
const { registerUser, loginUser } = require("../controllers/authControllers");

const router = express.Router();

// register user api
router.post("/register", registerUser);

// login user api
router.post("/login", loginUser);

module.exports = router;
