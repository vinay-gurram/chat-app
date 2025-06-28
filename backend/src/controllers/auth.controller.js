import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// ✅ SIGN UP
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ fullName, email, password: hashed, status: "online" });

    generateToken(newUser._id, res);

    res.status(201).json({
      user: { _id: newUser._id, fullName, email },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal error" });
  }
};

// ✅ LOGIN
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

    user.status = "online";
    await user.save();

    generateToken(user._id, res);

    res.status(200).json({
      user: { _id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.status = "offline";
      await user.save();
    }
  } catch (err) {
    console.error("Logout error:", err.message);
  }

  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 0,
  });
  res.status(200).json({ message: "Logged out" });
};

// ✅ PROFILE UPDATE 
export const updateProfile = async (req, res) => {
  const { fullName, profilePic, skills } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = fullName || user.fullName;
    user.profilePic = profilePic || user.profilePic;
    user.skills = skills || user.skills;

    await user.save();

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      skills: user.skills,
    });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Update failed" });
  }
};


// ✅ AUTH CHECK
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user); // Zustand expects full user object
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
