const jwt = require("jsonwebtoken");

const userModel = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await userModel.findById(decoded.userId).select("-password");

      console.log("req.user", req.user);

      if (req.user) {
        next();
      } else {
        res.status(401).json({ message: "Not authorized, user not found" });
      }
    } catch (error) {
      console.log("error", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = {
  protect,
};
