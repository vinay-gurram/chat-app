import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// ✅ Get users for sidebar with unread count
export const getUserForSidebar = async (req, res) => {
  try {
    const myId = req.user._id;

    // Fetch all users except myself (or use your accepted friends logic)
    const friends = await User.find({ _id: { $ne: myId } }).select("_id fullName profilePic");

    // Count unread messages grouped by sender
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: myId,
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    // Map unread counts
    const countMap = {};
    unreadCounts.forEach((u) => {
      countMap[u._id.toString()] = u.count;
    });

    // Attach unread count to each user
    const usersWithStatus = friends.map((friend) => ({
      ...friend.toObject(),
      unreadCount: countMap[friend._id.toString()] || 0,
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
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Send message with optional image and location
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

// ✅ Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const myId = req.user._id;
    const senderId = req.params.id;

    await Message.updateMany(
      { senderId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
