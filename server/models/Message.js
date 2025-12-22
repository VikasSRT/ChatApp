// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    // for future: files, images, etc.
    // attachments: [ ... ],

    // Anonymous handling
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    anonymousProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnonymousIdentity",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
