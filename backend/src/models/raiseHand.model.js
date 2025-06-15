import mongoose from "mongoose";

const raiseHandSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // Format: [longitude, latitude]
        required: true,
      },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ Required for geospatial queries
raiseHandSchema.index({ location: "2dsphere" });

export default mongoose.model("RaiseHand", raiseHandSchema);
