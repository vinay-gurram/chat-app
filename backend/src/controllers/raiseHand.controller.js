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

    // ✅ Step 1: Upsert current user's raise hand location and time
    await RaiseHand.findOneAndUpdate(
      { user: userId },
      { location, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // ✅ Step 2: Fetch nearby users within 5km and raised hand in last 10 minutes
    const nearby = await RaiseHand.find({
      location: {
        $nearSphere: {
          $geometry: location,
          $maxDistance: 5000,
        },
      },
      user: { $ne: userId },
      updatedAt: { $gte: tenMinutesAgo }, // ✅ only fresh hand raises
    }).populate("user", "fullName profilePic skills status location");

    // ✅ Step 3: Clean up old entries AFTER fetching
    await RaiseHand.deleteMany({ updatedAt: { $lt: tenMinutesAgo } });

    res.status(200).json({ users: nearby.map((entry) => entry.user) });
  } catch (err) {
    console.error("❌ Raise hand error:", err.message);
    res.status(500).json({ message: "Failed to raise hand" });
  }
};
