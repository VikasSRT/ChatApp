// models/Anonymous.js
const mongoose = require("mongoose");

const anonymousIdentitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    aliasName: {
      type: String, // e.g. "BlueTiger", "GhostCoder"
      required: true,
    },
    avatarSeed: {
      type: String, // some string to generate avatar/color on frontend
    },
  },
  { timestamps: true }
);

// Ensure one identity per user per room
anonymousIdentitySchema.index({ user: 1, room: 1 }, { unique: true });

module.exports = mongoose.model("AnonymousIdentity", anonymousIdentitySchema);
