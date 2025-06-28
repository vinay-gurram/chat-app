import Friend from "../models/friend.model.js";


// ✅ Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    const request = await Friend.findOneAndUpdate(
      {
        user: friendId,
        friend: userId,
        status: "pending",
      },
      { status: "accepted" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    res.status(200).json({ message: "Friend request accepted", request });
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Ignore (delete) friend request
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
      return res.status(404).json({ error: "Friend request not found" });
    }

    res.status(200).json({ message: "Friend request ignored" });
  } catch (error) {
    console.error("Ignore friend request error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ (Optional) Get pending friend requests (received)
export const getPendingFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Friend.find({
      friend: userId,
      status: "pending",
    }).populate("user", "username avatar");

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Fetch pending requests error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getNearbyUsers = async (req, res) => {
  try {
    // your nearby users logic here
  } catch (error) {
    console.error("Error in getNearbyUsers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getAcceptedFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const acceptedFriends = await Friend.find({
      $or: [{ user: userId }, { friend: userId }],
      status: "accepted",
    })
      .populate("user", "username fullName profilePic avatar skills location status")
      .populate("friend", "username fullName profilePic avatar skills location status");

    const result = acceptedFriends.map((f) => {
      const friendUser =
        f.user._id.toString() === userId.toString() ? f.friend : f.user;

      return {
        _id: friendUser._id,
        username: friendUser.username,
        fullName: friendUser.fullName,
        profilePic: friendUser.profilePic,
        avatar: friendUser.avatar, // fallback
        skills: friendUser.skills || [],
        location: friendUser.location,
        isOnline: friendUser.status === "online",
      };
    });

    res.status(200).json({ friends: result });
  } catch (error) {
    console.error("Fetch accepted friends error:", error);
    res.status(500).json({ error: "Failed to fetch accepted friends" });
  }
};

   