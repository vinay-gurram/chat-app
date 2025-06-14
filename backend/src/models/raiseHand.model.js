import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  location: { type: { type: String, enum: ["Point"] }, coordinates: [Number] },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

schema.index({ location: "2dsphere" });

export default mongoose.model("RaiseHand", schema);
