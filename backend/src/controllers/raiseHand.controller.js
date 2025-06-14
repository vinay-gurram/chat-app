import RaiseHand from "../models/raiseHand.model.js";
import User from "../models/user.model.js";
import { isUserOnline } from "../lib/socket.js"; 

export const raiseHandHandler = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user._id;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location required" });
    }

    // Save or update raise hand
    await RaiseHand.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update user location in User model
    await User.findByIdAndUpdate(userId, {
      location: {
        latitude,
        longitude,
      },
    });

    // Find nearby users who raised hand in last 10 minutes and within 5km
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const nearby = await RaiseHand.find({
      user: { $ne: userId },
      updatedAt: { $gte: tenMinutesAgo },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: 5000, // 5km
        },
      },
    }).populate("user", "fullName profilePic email location skills");

    const users = nearby.map((entry) => {
      const user = entry.user;
      return {
        _id: user._id,
        name: user.fullName,
        avatar: user.profilePic,
        email: user.email,
        skills: user.skills || [],
        location: {
          latitude: user.location?.latitude,
          longitude: user.location?.longitude,
        },
        isOnline: isUserOnline(user._id.toString()), // ✅ Add online status
      };
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Raise Hand Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
