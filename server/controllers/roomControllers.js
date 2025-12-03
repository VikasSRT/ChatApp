const Room = require("../models/Room");
const User = require("../models/User");

// Create 1-on-1 chat
const createDirectChat = async (req, res) => {
  try {
    const { userId } = req.body; // Target user ID
    const currentUserId = req.user._id;

    // Validation
    if (userId.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    // Check for existing direct chat
    const existingRoom = await Room.findOne({
      type: "direct",
      members: { $all: [currentUserId, userId], $size: 2 }
    });

    if (existingRoom) {
      return res.status(200).json({
        message: "Room already exists",
        room: existingRoom
      });
    }

    // Create new room
    const room = await Room.create({
      type: "direct",
      members: [currentUserId, userId]
    });

    res.status(201).json({
      message: "Direct chat created",
      room: {
        id: room._id,
        members: room.members,
        type: room.type
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create group chat
const createGroupChat = async (req, res) => {
  try {
    const { name, members: memberIds } = req.body;
    const currentUserId = req.user._id;

    // Validation
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: "Group name required (min 3 chars)" });
    }

    if (!Array.isArray(memberIds) || memberIds.length < 2) {
      return res.status(400).json({ message: "Min 2 members required" });
    }

    // Prevent duplicate members
    const uniqueMembers = [...new Set([...memberIds, currentUserId.toString()])];
    
    if (uniqueMembers.length !== memberIds.length + 1) {
      return res.status(400).json({ message: "Duplicate members not allowed" });
    }

    // Verify all users exist
    const validUsers = await User.find({ 
      _id: { $in: uniqueMembers } 
    });

    if (validUsers.length !== uniqueMembers.length) {
      return res.status(400).json({ message: "Invalid member IDs" });
    }

    // Create room
    const room = await Room.create({
      name: name.trim(),
      type: "group",
      members: uniqueMembers,
      admins: [currentUserId] // Creator is admin
    });

    res.status(201).json({
      message: "Group created",
      room: {
        id: room._id,
        name: room.name,
        members: room.members,
        admins: room.admins,
        type: room.type
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createDirectChat,
  createGroupChat
};