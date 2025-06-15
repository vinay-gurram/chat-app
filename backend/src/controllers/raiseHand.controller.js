import RaiseHand from "../models/raiseHand.model.js";
import User from "../models/user.model.js";

export const raiseHandHandler = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user._id;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location data missing" });
    }

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    // Update or insert user's raise hand
    await RaiseHand.findOneAndUpdate(
      { user: userId },
      { location, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Remove raise hands older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    await RaiseHand.deleteMany({ updatedAt: { $lt: tenMinutesAgo } });

    // Find users within 5km radius
    const nearby = await RaiseHand.find({
      location: {
        $nearSphere: {
          $geometry: location,
          $maxDistance: 5000,
        },
      },
      user: { $ne: userId },
    }).populate("user", "fullName profilePic skills status location");

    // ✅ Return properly named field for frontend
    res.status(200).json({ users: nearby.map((entry) => entry.user) });

  } catch (err) {
    console.error("❌ Raise hand error:", err.message);
    res.status(500).json({ message: "Failed to raise hand" });
  }
};
