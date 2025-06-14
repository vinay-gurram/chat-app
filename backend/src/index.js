import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env variables first

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

// ✅ Import API routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import raiseHandRoutes from "./routes/raiseHand.route.js";
import feedRoutes from "./routes/feed.route.js";
import friendRoutes from "./routes/friend.route.js";
import chatUsersRoute from "./routes/chatUsers.route.js";

// ✅ Connect to MongoDB
connectDB();

// ✅ Enable CORS for localhost + Vercel domain
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local frontend
      "https://chat-app-1-git-main-vinays-projects-076db223.vercel.app", // Vercel deployed frontend
    ],
    credentials: true, // Allow cookies
  })
);

// ✅ Common middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ✅ Register API routes
app.use("/api/auth", authRoutes);            //  Auth: login/signup/check
app.use("/api/messages", messageRoutes);     //  Chat messages
app.use("/api/raise-hand", raiseHandRoutes); //  Raise hand
app.use("/api/feed", feedRoutes);            //  Feed of nearby users
app.use("/api/friends", friendRoutes);       //  Friends management
app.use("/api/chat-users", chatUsersRoute);  //  Online users sidebar

// ✅ Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
