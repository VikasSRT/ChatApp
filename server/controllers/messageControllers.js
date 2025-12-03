const Message = require("../models/Message");
const Room = require("../models/Room");

const sendMessage = async (req, res) => {
  try {
    const { roomId, content } = req.body;
    const userId = req.user._id;

    // Validation
    if (!roomId || !content) {
      return res.status(400).json({ 
        message: "Room ID and content are required" 
      });
    }

    // 1. Verify user is in the room
    const room = await Room.findOne({
      _id: roomId,
      members: userId
    });
    
    if (!room) {
      return res.status(403).json({ 
        message: "You don't have access to this chat" 
      });
    }

    // 2. Create message
    const message = await Message.create({
      room: roomId,
      sender: userId,
      content: content.trim()
    });

    // 3. Update room's last message
    await Room.findByIdAndUpdate(roomId, {
      lastMessage: message._id,
      updatedAt: Date.now()
    });

    // 4. Return success
    res.status(201).json({
      id: message._id,
      content: message.content,
      sender: userId,
      createdAt: message.createdAt
    });
  } catch (error) {
    console.error("Message error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

module.exports = { sendMessage };