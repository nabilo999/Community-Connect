const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

/**
 * GET /api/users/me
 * Returns the logged-in user's profile.
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "_id name email bio avatarUrl"
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
    });
  } catch (err) {
    console.error("GET /api/users/me error", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * PUT /api/users/me
 * Updates user profile and updates ALL old posts to reflect new name/avatar.
 */
router.put("/me", requireAuth, async (req, res) => {
  try {
    const { name, email, bio, avatarUrl } = req.body || {};

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Update user fields
    if (typeof name === "string") user.name = name.trim();
    if (typeof email === "string") user.email = email.trim().toLowerCase();
    if (typeof bio === "string") user.bio = bio;
    if (typeof avatarUrl === "string") user.avatarUrl = avatarUrl;

    await user.save();

    const userIdStr = String(user._id);
    const nextAuthorName = user.name;
    const nextAvatarUrl = user.avatarUrl || "";

    // ✅ Update ALL old posts by this user (post header/avatar)
    await Post.updateMany(
      { userId: userIdStr },
      { $set: { authorName: nextAuthorName, avatarUrl: nextAvatarUrl } }
    );

    // ✅ Update ALL old comments by this user (safe approach: read + rewrite)
    // This avoids MongoDB arrayFilters issues that can cause 500 errors.
    const postsWithMyComments = await Post.find(
      { "comments.userId": userIdStr },
      { comments: 1 }
    );

    for (const p of postsWithMyComments) {
      let changed = false;

      const updatedComments = (p.comments || []).map((c) => {
        if (String(c.userId) === userIdStr) {
          changed = true;
          return {
            ...c.toObject?.() ? c.toObject() : c,
            authorName: nextAuthorName,
            avatarUrl: nextAvatarUrl,
          };
        }
        return c;
      });

      if (changed) {
        p.comments = updatedComments;
        await p.save();
      }
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (err) {
    console.error("PUT /api/users/me error", err);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;