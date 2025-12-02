// controllers/chatControllers.js

const Room = require("../models/Room"); // Adjust path as needed
const Message = require("../models/Message"); // Needed for 'lastMessage' population

const getChats = async (req, res, next) => {
  // IMPORTANT: Include 'next' argument
  try {
    // 1. Identify User: The 'protect' middleware ensures req.user exists
    //    and contains the authenticated user's document, including their _id.
    const currentUserId = req.user._id;

    // 2. Query Rooms, Populate, and Sort
    const rooms = await Room.find({
      members: currentUserId,
    })
      .select("-admins")
      .populate({
        path: "members",
        select: "username avatarUrl",
        match: { _id: { $ne: currentUserId } },
      })
      .populate({
        path: "lastMessage", // Assuming this field is in your Room model
        select: "content sender createdAt isAnonymous anonymousProfile",
        populate: {
          path: "anonymousProfile",
          select: "aliasName avatarSeed",
        },
      })
      .sort({ updatedAt: -1 });

    // 3. Prepare response data (Mapping the result for cleaner frontend use)
    const chatList = rooms.map((room) => {
      let chatName = room.name;
      let chatAvatar = null;
      let isGroup = room.type !== "direct";

      // Custom handling for Direct Messages (DM)
      if (room.type === "direct" && room.members.length > 0) {
        const otherUser = room.members[0];
        chatName = otherUser?.username || "Unknown User";
        chatAvatar = otherUser?.avatarUrl;
      }

      return {
        id: room._id,
        name: chatName,
        type: room.type,
        isGroup: isGroup,
        avatarUrl: chatAvatar,
        lastMessage: room.lastMessage,
        updatedAt: room.updatedAt,
      };
    });

    // 4. Send Response
    res.status(200).json(chatList);
  } catch (error) {
    // Crucial Step: If any asynchronous operation fails,
    // manually pass the error to the Express error handler.
    console.error("Error fetching chats:", error);
    next(error);
  }
};

module.exports = {
  getChats,
};
