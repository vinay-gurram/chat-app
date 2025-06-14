import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  ignoreFriendRequest,
  getPendingFriendRequests,
  getAcceptedFriends,
  unfriendUser,
} from "../controllers/friend.controller.js";
import Friend from "../models/friend.model.js";

const router = express.Router();

router.post("/send", protectRoute, async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    if (!friendId) return res.status(400).json({ message: "friendId is required" });
    if (userId.toString() === friendId)
      return res.status(400).json({ message: "Cannot send request to yourself" });

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
    });

    res.status(201).json({ message: "Friend request sent", request });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ message: "Failed to send friend request" });
  }
});

router.post("/accept", protectRoute, acceptFriendRequest);
router.post("/ignore", protectRoute, ignoreFriendRequest);
router.get("/pending", protectRoute, getPendingFriendRequests);
router.get("/accepted", protectRoute, getAcceptedFriends);
router.post("/unfriend", protectRoute, unfriendUser);

export default router;
