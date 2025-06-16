import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import dotenv from "dotenv";
dotenv.config();

// ✅ Signup - POST /api/auth/signup
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic || "",
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Login - POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic || "",
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Logout - POST /api/auth/logout
export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 0,
  });
  res.status(200).json({ message: "Logout successful" });
};

// ✅ Update Profile - PATCH /api/auth/update-profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, skills, location, profilePic } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (skills) updateData.skills = skills;

    if (location?.latitude && location?.longitude) {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${apiKey}`
      );

      const geoData = await geoRes.json();
      const address = geoData.results?.[0]?.formatted_address || "";

      updateData.location = {
        latitude: location.latitude,
        longitude: location.longitude,
        address,
      };
    }

    if (profilePic) {
      const uploadRes = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadRes.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Check Auth - GET /api/auth/check
export const checkAuth = (req, res) => {
  const user = req.user;

  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic || "",
    skills: user.skills || [],
    location: user.location || {},
    createdAt: user.createdAt,
  });
};
