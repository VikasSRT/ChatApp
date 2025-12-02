// models/Room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String, // group name, for direct chats you can auto-generate
    },
    type: {
      type: String,
      enum: ["direct", "group", "anonymous_group"],
      default: "group",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isAnonymousWorld: {
      type: Boolean,
      default: false, // true for anonymous rooms/world
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
