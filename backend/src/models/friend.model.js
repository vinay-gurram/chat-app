import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    friend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate friend requests (same pair)
friendSchema.index({ user: 1, friend: 1 }, { unique: true });

const Friend = mongoose.model("Friend", friendSchema);
export default Friend;