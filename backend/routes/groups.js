const express = require("express");
const mongoose = require("mongoose");
const Group = require("../models/Group");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

//getting all groups to display 
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups", err);
    res.status(500).json({ message: "Error fetching groups" });
  }
});

//getting all groups user is in
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("joinedGroups");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.joinedGroups || []);
  } catch (err) {
    console.error("Error fetching user's groups", err);
    res.status(500).json({ message: "Error fetching user's groups" });
  }
});

//getting a single group id 
router.get("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: "Invalid group id." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group);
  } catch (err) {
    console.error("Error fetching group", err);
    res.status(500).json({ message: "Error fetching group" });
  }
});

//functionality for creating group
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, image } = req.body;
    const trimmed = String(name || "").trim();

    if (!trimmed) {
      return res.status(400).json({ message: "Group name is required." });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const group = await Group.create({
      name: trimmed,
      image: String(image || ""),
      createdBy: userId,
      members: [userId],
    });

    await User.updateOne(
      { _id: userId },
      { $addToSet: { joinedGroups: group._id } }
    );

    res.status(201).json(group);
  } catch (err) {
    console.error("Error creating group", err);
    res.status(500).json({ message: "Error creating group" });
  }
});

//function for joining group
router.post("/:groupId/join", requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: "Invalid group id." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    await Group.updateOne(
      { _id: groupId },
      { $addToSet: { members: req.user.id } }
    );

    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { joinedGroups: groupId } }
    );

    res.json(await Group.findById(groupId));
  } catch (err) {
    console.error("Error joining group", err);
    res.status(500).json({ message: "Error joining group" });
  }
});

//functionality for leaving group
router.post("/:groupId/leave", requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: "Invalid group id." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    await Group.updateOne(
      { _id: groupId },
      { $pull: { members: req.user.id } }
    );

    await User.updateOne(
      { _id: req.user.id },
      { $pull: { joinedGroups: groupId } }
    );

    res.json(await Group.findById(groupId));
  } catch (err) {
    console.error("Error leaving group", err);
    res.status(500).json({ message: "Error leaving group" });
  }
});

module.exports = router;