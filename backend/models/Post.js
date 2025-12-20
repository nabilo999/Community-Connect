const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    authorName: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);
//schema for db for a post
const postSchema = new mongoose.Schema(
  {
    //this will record who posted the post
    userId: { type: String, required: true },
    authorName: { type: String, required: true },
    avatarUrl: { type: String, default: "" },

    //this will contain the description, event time, and location for each post
    description: { type: String, required: true },
    eventTime: { type: String, default: "" }, // store as ISO/datetime-local string
    location: { type: String, default: "" },

    //this will hold the images for the post (not necessary) - now supports multiple images
    images: [{ type: String }],

    // optional: associated group for this post
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    groupName: { type: String, default: "" },

    //there will be a seperate schema for comments
    comments: [commentSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);