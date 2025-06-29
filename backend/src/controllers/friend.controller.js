import Friend from "../models/friend.model.js";
import User from "../models/user.model.js";

// ✅ Send Friend Request
export const sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    if (userId.toString() === friendId) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    const existing = await Friend.findOne({
      $or: [
        { user: userId, friend: friendId },
        { user: friendId, friend: userId },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    const request = await Friend.create({ user: userId, friend: friendId });

    res.status(201).json({ message: "Friend request sent", request });
  } catch (err) {
    console.error("Send friend request error:", err);
    res.status(500).json({ message: "Failed to send friend request" });
  }
};

// ✅ Accept Friend Request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    const request = await Friend.findOneAndUpdate(
      { user: friendId, friend: userId, status: "pending" },
      { status: "accepted" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    res.status(200).json({ message: "Friend request accepted", request });
  } catch (err) {
    res.status(500).json({ message: "Accept failed" });
  }
};

// ✅ Ignore Friend Request
export const ignoreFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    const request = await Friend.findOneAndDelete({
      user: friendId,
      friend: userId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request ignored" });
  } catch (err) {
    res.status(500).json({ message: "Ignore failed" });
  }
};

// ✅ Get Pending Requests
export const getPendingFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Friend.find({
      friend: userId,
      status: "pending",
    }).populate("user", "username fullName email avatar profilePic");

    const result = requests.map((r) => {
      const u = r.user;
      return {
        _id: u._id,
        username: u.username || "No username",
        fullName: u.fullName || "No name",
        email: u.email || "No email",
        avatar: u.profilePic || u.avatar || "/avatar.png",
      };
    });

    res.status(200).json({ requests: result });
  } catch (err) {
    console.error("Get pending requests error:", err);
    res.status(500).json({ message: "Failed to fetch pending requests" });
  }
};


// ✅ Get Accepted Friends
export const getAcceptedFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const acceptedFriends = await Friend.find({
      $or: [{ user: userId }, { friend: userId }],
      status: "accepted",
    })
      .populate("user", "username fullName profilePic avatar email")
      .populate("friend", "username fullName profilePic avatar email");

    const result = acceptedFriends.map((f) => {
      const isUser = f.user._id.toString() === userId.toString();
      const friendUser = isUser ? f.friend : f.user;

      return {
        _id: friendUser._id,
        username: friendUser.username || "No username",
        fullName: friendUser.fullName || "No name",
        avatar: friendUser.profilePic || friendUser.avatar || "/avatar.png",
        email: friendUser.email || "No email",
      };
    });

    res.status(200).json({ friends: result });
  } catch (err) {
    console.error("Get accepted friends error:", err);
    res.status(500).json({ message: "Failed to fetch accepted friends" });
  }
};




// ✅ Unfriend Logic
export const unfriendUser = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    const deleted = await Friend.findOneAndDelete({
      $or: [
        { user: userId, friend: friendId },
        { user: friendId, friend: userId },
      ],
      status: "accepted",
    });

    if (!deleted) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    res.status(200).json({ message: "Unfriended successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to unfriend user" });
  }
};