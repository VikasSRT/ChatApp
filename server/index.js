const express = require("express");
require("dotenv").config();
// const { Server } = require("socket.io");
const { createServer } = require("http");
const connectDB = require("./config/connectDb");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const { protect } = require("./middleware/authMiddleware");

connectDB();

const app = express();
const server = createServer(app);

app.use(express.json());

app.use("/api/", authRoutes);

app.use("/api/", protect, chatRoutes);

app.get("/", (req, res) => {
  res.send("Say Hello To Your Chat App!");
});

server.listen(3000, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
