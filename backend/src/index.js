import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

// Import routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import raiseHandRoutes from "./routes/raiseHand.route.js";
import feedRoutes from "./routes/feed.route.js";
import friendRoutes from "./routes/friend.route.js";
import chatUsersRoute from "./routes/chatUsers.route.js";

// ✅ Connect to MongoDB
connectDB();

// ✅ Read allowed origins from env or fallback
const allowedOrigins = process.env.CORS_ORIGIN
  ? [process.env.CORS_ORIGIN, "http://localhost:5173"]
  : [
      "http://localhost:5173",
      "https://chat-app-git-main-vinays-projects-076db223.vercel.app",
      "https://chat-app.vercel.app",
    ];

// ✅ CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.some((o) => origin.includes(o))) {
        callback(null, true);
      } else {
        console.error("❌ CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/raise-hand", raiseHandRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chat-users", chatUsersRoute);

// ✅ Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
