const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middleware/requireAuth");
const Event = require("../models/Event");
const User = require("../models/User");
const Group = require("../models/Group");

const router = express.Router();

// Get user's joined events
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("joinedEvents");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Also populate group info for each event
    const eventsWithGroups = await Promise.all(
      (user.joinedEvents || []).map(async (event) => {
        const eventObj = event.toObject ? event.toObject() : event;
        const group = await Group.findById(eventObj.groupId);
        return {
          ...eventObj,
          groupName: group?.name || "Unknown Group",
        };
      })
    );
    
    res.json(eventsWithGroups);
  } catch (err) {
    console.error("Error fetching user's events", err);
    res.status(500).json({ message: "Error fetching user's events" });
  }
});

// Get joinable events (events from groups user is in but hasn't joined)
router.get("/joinable", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("joinedGroups joinedEvents");
    if (!user) return res.status(404).json({ message: "User not found" });

    const joinedGroupIds = user.joinedGroups || [];
    const joinedEventIds = (user.joinedEvents || []).map((e) => String(e));

    if (joinedGroupIds.length === 0) {
      return res.json([]);
    }

    // Get all events from groups user is in
    const allEvents = await Event.find({
      groupId: { $in: joinedGroupIds },
    }).sort({ eventTime: 1 });

    // Filter out events user has already joined and only show future events
    const now = new Date();
    const joinable = allEvents
      .filter((event) => {
        const eventId = String(event._id);
        const isNotJoined = !joinedEventIds.includes(eventId);
        const isFuture = event.eventTime && new Date(event.eventTime) >= now;
        return isNotJoined && isFuture;
      })
      .slice(0, 20); // Limit to 20 most recent

    // Populate group names
    const eventsWithGroups = await Promise.all(
      joinable.map(async (event) => {
        const eventObj = event.toObject ? event.toObject() : event;
        const group = await Group.findById(eventObj.groupId);
        return {
          ...eventObj,
          groupName: group?.name || "Unknown Group",
        };
      })
    );

    res.json(eventsWithGroups);
  } catch (err) {
    console.error("Error fetching joinable events", err);
    res.status(500).json({ message: "Error fetching joinable events" });
  }
});

// Join/RSVP to an event
router.post("/:eventId/join", requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event id." });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      console.log("Event not found:", eventId);
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is a member of the group that owns this event
    const user = await User.findById(req.user.id).select("joinedGroups");
    if (!user) {
      console.log("User not found:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    const eventGroupId = String(event.groupId);
    const userGroupIds = (user.joinedGroups || []).map((g) => String(g));
    
    console.log("Event groupId:", eventGroupId);
    console.log("User joinedGroups:", userGroupIds);
    
    const isMember = userGroupIds.includes(eventGroupId);

    if (!isMember) {
      console.log("User is not a member of the group");
      return res.status(403).json({
        message: "You must be a member of the group to join its events.",
      });
    }

    // Add event to user's joinedEvents
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { joinedEvents: eventId } }
    );

    // Populate group info
    const group = await Group.findById(event.groupId);
    const eventObj = event.toObject ? event.toObject() : event;

    res.json({
      ...eventObj,
      groupName: group?.name || "Unknown Group",
    });
  } catch (err) {
    console.error("Error joining event", err);
    res.status(500).json({ message: "Error joining event: " + err.message });
  }
});

// Leave an event
router.post("/:eventId/leave", requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event id." });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Remove event from user's joinedEvents
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { joinedEvents: eventId } }
    );

    res.json({ message: "Left event successfully" });
  } catch (err) {
    console.error("Error leaving event", err);
    res.status(500).json({ message: "Error leaving event" });
  }
});

module.exports = router;

