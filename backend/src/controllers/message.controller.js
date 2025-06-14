import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io, isUserOnline } from "../lib/socket.js";

// ✅ Get users for sidebar (with online/offline)
export const getUserForSidebar = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");

    const usersWithStatus = users.map((user) => ({
      _id: user._id,
      fullName: user.fullName,
      profilePic: user.profilePic,
      email: user.email,
      skills: user.skills || [],
      location: user.location || {},
      isOnline: isUserOnline(user._id.toString()),
    }));

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("Sidebar error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const userToChatId = req.params.id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // optional: sort by time

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Send message (text, image, location)
export const sendMessage = async (req, res) => {
  try {
    const { text, image, location } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl || "",
      location: location || null,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send message error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
