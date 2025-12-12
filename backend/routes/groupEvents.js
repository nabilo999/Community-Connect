const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middleware/requireAuth");
const Event = require("../models/Event");
const User = require("../models/User");

const router = express.Router({ mergeParams: true });

//only for group memebers to post and read events
async function requireGroupMember(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: "Invalid group id." });
    }

    const user = await User.findById(userId).select("joinedGroups name avatarUrl");
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMember = (user.joinedGroups || []).some(
      (g) => String(g) === String(groupId)
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this group." });
    }

    //hold the user 
    req.dbUser = user;
    next();
  } catch (err) {
    console.error("requireGroupMember error", err);
    res.status(500).json({ message: "Server error." });
  }
}

//getting the events from db 
router.get("/", requireAuth, requireGroupMember, async (req, res) => {
  try {
    const { groupId } = req.params;
    const events = await Event.find({ groupId }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("Error fetching events", err);
    res.status(500).json({ message: "Error fetching events" });
  }
});

//create events
router.post("/", requireAuth, requireGroupMember, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, eventTime, location, image } = req.body;

    const t = String(title || "").trim();
    const d = String(description || "").trim();

    if (!t || !d) {
      return res.status(400).json({ message: "Title and description are required." });
    }
    //use middleware
    const user = req.dbUser; 

    const created = await Event.create({
      groupId,
      userId: String(req.user.id),
      authorName: user.name,
      avatarUrl: user.avatarUrl || "",
      title: t,
      description: d,
      eventTime: eventTime || "",
      location: location || "",
      image: image || "",
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating event", err);
    res.status(500).json({ message: "Error creating event" });
  }
});

//delete a group only for the creator to do 
router.delete("/:eventId", requireAuth, requireGroupMember, async (req, res) => {
  try {
    const { groupId, eventId } = req.params;

    const ev = await Event.findOne({ _id: eventId, groupId });
    if (!ev) return res.status(404).json({ message: "Event not found" });

    if (String(ev.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only delete your own events." });
    }

    await ev.deleteOne();
    res.json({ message: "Event deleted successfully.", id: eventId });
  } catch (err) {
    console.error("Error deleting event", err);
    res.status(500).json({ message: "Error deleting event" });
  }
});

//allowing for comments on a post
router.post("/:eventId/comments", requireAuth, requireGroupMember, async (req, res) => {
  try {
    const { groupId, eventId } = req.params;
    const text = String(req.body?.text || "").trim();

    if (!text) return res.status(400).json({ message: "Comment text is required." });

    const ev = await Event.findOne({ _id: eventId, groupId });
    if (!ev) return res.status(404).json({ message: "Event not found" });

    const user = req.dbUser;

    ev.comments.push({
      userId: String(req.user.id),
      authorName: user.name,
      avatarUrl: user.avatarUrl || "",
      text,
    });

    const updated = await ev.save();
    res.status(201).json(updated);
  } catch (err) {
    console.error("Error adding comment", err);
    res.status(500).json({ message: "Error adding comment" });
  }
});

//deleting a group event
router.delete(
  "/:eventId/comments/:commentId",
  requireAuth,
  requireGroupMember,
  async (req, res) => {
    try {
      const { groupId, eventId, commentId } = req.params;

      const ev = await Event.findOne({ _id: eventId, groupId });
      if (!ev) return res.status(404).json({ message: "Event not found" });

      const comment = ev.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: "Comment not found" });

      if (String(comment.userId) !== String(req.user.id)) {
        return res.status(403).json({ message: "You can only delete your own comments." });
      }

      comment.deleteOne();
      const updated = await ev.save();
      res.json(updated);
    } catch (err) {
      console.error("Error deleting comment", err);
      res.status(500).json({ message: "Error deleting comment" });
    }
  }
);

module.exports = router;