import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    skills: {
      type: [String], // up to 4 skills
      default: [],
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["online", "offline", "away", "busy"],
      default: "offline",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
