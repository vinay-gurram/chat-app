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

    // ✅ Step 1: Upsert user's raise hand location
    await RaiseHand.findOneAndUpdate(
      { user: userId },
      { location, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // ✅ Step 2: Update user's own location in User model (needed for frontend map)
    await User.findByIdAndUpdate(userId, {
      location: {
        latitude,
        longitude,
        address: "", // Optional - fill with reverse geocoded address if you want
      },
    });

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // 10 mins ago

    // ✅ Step 3: Find nearby users who raised hand recently (not current user)
    const nearby = await RaiseHand.find({
      location: {
        $nearSphere: {
          $geometry: location,
          $maxDistance: 5000, // 5km
        },
      },
      user: { $ne: userId },
      updatedAt: { $gte: tenMinutesAgo }, // only recent ones
    }).populate("user", "fullName profilePic skills status location");

    // ✅ Step 4: Delete old hand raise entries (optional cleanup)
    await RaiseHand.deleteMany({ updatedAt: { $lt: tenMinutesAgo } });

    // ✅ Step 5: Send nearby users to frontend
    res.status(200).json({ users: nearby.map(entry => entry.user) });
  } catch (err) {
    console.error("❌ Raise hand error:", err.message);
    res.status(500).json({ message: "Failed to raise hand" });
  }
};
