// controllers/chatControllers.js (add this function)

const Message = require("../models/Message");
const Room = require("../models/Room");

const sendMessage = async (req, res) => {
  try {
    const { roomId, content } = req.body;
    const userId = req.user._id;

    // Validation
    if (!roomId || !content?.trim()) {
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
    const message = new Message({
      room: roomId,
      sender: userId,
      content: content.trim()
    });

    // 3. Handle anonymous messages if needed (optional)
    // if (room.isAnonymousWorld) {
    //   const anonymousIdentity = await getAnonymousIdentity(userId, roomId);
    //   message.isAnonymous = true;
    //   message.anonymousProfile = anonymousIdentity._id;
    // }

    await message.save();

    // 4. Update room's last message and timestamp
    room.lastMessage = message._id;
    room.updatedAt = Date.now();
    await room.save();

    // 5. Return success (with populated sender for immediate display)
    await message.populate('sender', 'username avatarUrl');
    
    res.status(201).json({
      _id: message._id,
      content: message.content,
      sender: message.sender,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    });
  } catch (error) {
    console.error("Message error:", error);
    res.status(500).json({ 
      message: "Failed to send message",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// get messages for a chat

// controllers/chatControllers.js

const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user._id;

    // 1. Verify user has access to this room
    const room = await Room.findOne({
      _id: roomId,
      members: currentUserId
    });
    
    if (!room) {
      return res.status(403).json({ 
        message: "You don't have access to this chat" 
      });
    }

    // 2. Fetch messages with proper population
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: 1 }) // Oldest first for proper display
      .populate({
        path: 'sender',
        select: 'username avatarUrl'
      })
      .populate({
        path: 'anonymousProfile',
        select: 'aliasName avatarSeed'
      });

    // 3. Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      content: msg.content,
      isAnonymous: msg.isAnonymous,
      sender: msg.isAnonymous 
        ? {
            _id: null,
            username: msg.anonymousProfile?.aliasName || "Anonymous",
            avatarUrl: `/api/anonymous-avatar?seed=${msg.anonymousProfile?.avatarSeed || 'default'}`
          }
        : msg.sender,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt
    }));

    // 4. Return success
    res.status(200).json({
      messages: formattedMessages,
      roomId: roomId,
      chatType: room.type,
      currentUserId: currentUserId
    });
  } catch (error) {
    console.error("Message fetch error:", error);
    res.status(500).json({ 
      message: "Failed to load messages",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = { 
  sendMessage, 
  getMessages 
};