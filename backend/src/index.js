import dotenv from "dotenv";
dotenv.config(); // ✅ Load environment variables first

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

// ✅ Import Routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import raiseHandRoutes from "./routes/raiseHand.route.js";
import feedRoutes from "./routes/feed.route.js";
import friendRoutes from "./routes/friend.route.js";
import chatUsersRoute from "./routes/chatUsers.route.js";

// ✅ Connect MongoDB
connectDB();

// ✅ Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // for local development
      "https://chat-app-1-git-main-vinays-projects-076db223.vercel.app", // your deployed Vercel frontend
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ✅ API Routes
app.use("/api/auth", authRoutes);           // Authentication
app.use("/api/messages", messageRoutes);    // Chat messages
app.use("/api/raise-hand", raiseHandRoutes); // Raise Hand feature
app.use("/api/feed", feedRoutes);           // Nearby users
app.use("/api/friends", friendRoutes);      // Friend system
app.use("/api/chat-users", chatUsersRoute); // Sidebar users (online)

// ✅ Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
