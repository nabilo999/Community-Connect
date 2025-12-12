// backend/models/Group.js
const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //keep members for fast membership queries
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);