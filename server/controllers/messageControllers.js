// controllers/chatControllers.js (add this function)

const Message = require("../models/Message");
const Room = require("../models/Room");

const sendMessage = async (req, res) => {
  try {
    const { roomId, content } = req.body;
    const userId = req.user._id;
    console.log("userId", userId);

    // Validation
    if (!roomId || !content?.trim()) {
      return res.status(400).json({
        message: "Room ID and content are required",
      });
    }

    // 1. Verify user is in the room
    const room = await Room.findOne({
      _id: roomId,
      members: userId,
    });

    if (!room) {
      return res.status(403).json({
        message: "You don't have access to this chat",
      });
    }

    // 2. Create message
    const message = new Message({
      room: roomId,
      sender: userId,
      content: content.trim(),
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
    await message.populate("sender", "username avatarUrl");

    res.status(201).json({
      _id: message._id,
      content: message.content,
      sender: message.sender,
      roomId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    });
  } catch (error) {
    console.error("Message error:", error);
    res.status(500).json({
      message: "Failed to send message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// get messages for a chat

const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user._id;

    // 1. Verify user has access to this room
    const room = await Room.findOne({
      _id: roomId,
      members: currentUserId,
    });

    if (!room) {
      return res.status(403).json({
        message: "You don't have access to this chat",
      });
    }

    // 2. Fetch messages with proper population
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: 1 }) // Oldest first for proper display
      .populate({
        path: "sender",
        select: "username avatarUrl",
      })
      .populate({
        path: "anonymousProfile",
        select: "aliasName avatarSeed",
      });

    // 3. Format messages for frontend
    const formattedMessages = messages.map((msg) => ({
      _id: msg._id,
      content: msg.content,
      isAnonymous: msg.isAnonymous,
      sender: msg.isAnonymous
        ? {
            _id: null,
            username: msg.anonymousProfile?.aliasName || "Anonymous",
            avatarUrl: `/api/anonymous-avatar?seed=${
              msg.anonymousProfile?.avatarSeed || "default"
            }`,
          }
        : msg.sender,
      currentUserId,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));

    // 4. Return success
    res.status(200).json({
      messages: formattedMessages,
      roomId: roomId,
      chatType: room.type,
    });
  } catch (error) {
    console.error("Message fetch error:", error);
    res.status(500).json({
      message: "Failed to load messages",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Edit message controller

const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    // 1. Find message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // 2. Check permissions (only sender can edit)
    if (message.sender.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only edit your own messages" });
    }

    console.log("content", content);

    // 3. Update message
    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    // 4. Return updated message
    // We populate sender to keep the data structure consistent for the frontend
    await message.populate("sender", "username avatarUrl");

    res.status(200).json({
      message: "Message updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({ message: "Failed to edit message" });
  }
};

// Delete message controller

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    // 1. Find message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // 2. Check room access
    const room = await Room.findOne({
      _id: message.room,
      members: currentUserId,
    });

    if (!room) {
      return res.status(403).json({
        message: "You don't have access to this chat",
      });
    }

    // 3. Only sender can delete their message
    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        message: "You can only delete your own messages",
      });
    }

    // 4. Delete message
    await message.deleteOne();

    // 5. Update room lastMessage if needed
    if (room.lastMessage?.toString() === messageId) {
      const lastMessage = await Message.findOne({ room: room._id }).sort({
        createdAt: -1,
      });

      room.lastMessage = lastMessage ? lastMessage._id : null;
      await room.save();
    }

    // 6. Success response
    res.status(200).json({
      message: "Message deleted successfully",
      messageId,
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      message: "Failed to delete message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
};
