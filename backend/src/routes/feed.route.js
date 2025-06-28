import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  ignoreFriendRequest,
  getPendingFriendRequests,
  getAcceptedFriends,
} from "../controllers/friend.controller.js";
import Friend from "../models/friend.model.js";

const router = express.Router();

// ✅ Send friend request
router.post("/send", protectRoute, async (req, res) => {
  const { friendId } = req.body;
  const userId = req.user._id;

  if (userId.toString() === friendId) {
    return res.status(400).json({ error: "You cannot send request to yourself." });
  }

  try {
    const existing = await Friend.findOne({
      $or: [
        { user: userId, friend: friendId },
        { user: friendId, friend: userId },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    const request = await Friend.create({
      user: userId,
      friend: friendId,
      status: "pending",
    });

    res.status(201).json({ message: "Friend request sent", request });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// ✅ Accept friend request
router.post("/accept", protectRoute, acceptFriendRequest);

// ✅ Ignore (decline) friend request
router.post("/ignore", protectRoute, ignoreFriendRequest);

// ✅ Get friend requests sent *to* you
router.get("/pending", protectRoute, getPendingFriendRequests);

// ✅ Get list of accepted friends
router.get("/accepted", protectRoute, getAcceptedFriends);

export default router;