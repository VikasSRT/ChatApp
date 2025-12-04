const express = require("express");
require("dotenv").config();
const { Server } = require("socket.io");
const { createServer } = require("http");
const connectDB = require("./config/connectDb");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const roomRoutes = require("./routes/room");
const messageRoutes = require("./routes/messages")
const userRoutes = require("./routes/users");
const { protect } = require("./middleware/authMiddleware");

connectDB();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors:{
    origin: "*",
  }
})

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
});

app.use(express.json());

app.use("/api/auth/", authRoutes);

app.use("/api/", protect, chatRoutes);

app.use("/api/rooms", protect, roomRoutes);
app.use("/api/messages", protect, messageRoutes)
app.use("/api/users", protect, userRoutes);

app.get("/", (req, res) => {
  res.send("Say Hello To Your Chat App!");
});

server.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
