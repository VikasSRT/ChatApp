const express = require("express");
require("dotenv").config();
const { Server } = require("socket.io");
const { createServer } = require("http");
const cors = require("cors");
const connectDB = require("./config/connectDb");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const roomRoutes = require("./routes/room");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");
const { protect } = require("./middleware/authMiddleware");

connectDB();

const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: "https://chatapp-frontend-ctkb.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log("User Joined Room with ID :-", roomId);
  });

  // typing events

  socket.on("typing", (user) => {
    console.log(user, "is Typing...");
    socket.broadcast.emit("user-typing", user);
  });

  socket.on("stop-typing", (user) => {
    socket.broadcast.emit("user-stop-typing", user);
    console.log(user, "stopped Typing...");
  });

  // for editing messages

  socket.on("edit-message", (data) => {
    // data = { roomId, messageId, newContent }
    console.log("Message Edited:", data.messageId);
    // Broadcast to everyone in the room (including sender to confirm update)
    io.to(data.roomId).emit("message-updated", data);
  });

  // for delete messages
  socket.on("delete-message", (data) => {
    const { messageId, roomId } = data;
    // Broadcast to everyone in the room (including sender)
    io.to(roomId).emit("message-deleted", messageId);
  });

  // for new received message
  socket.on("newMessage", (data) => {
    io.to(data.roomId).emit("message received", data);
  });
});

app.use(express.json());

app.use("/api/auth/", authRoutes);

app.use("/api/", protect, chatRoutes);

app.use("/api/rooms", protect, roomRoutes);
app.use("/api/messages", protect, messageRoutes);
app.use("/api/users", protect, userRoutes);

app.get("/", (req, res) => {
  res.send("Say Hello To Your Chat App!");
});

server.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
