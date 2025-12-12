const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    authorName: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },

    userId: { type: String, required: true },
    authorName: { type: String, required: true },
    avatarUrl: { type: String, default: "" },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    eventTime: { type: String, default: "" }, 
    location: { type: String, default: "" },
    image: { type: String, default: "" }, 

    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);