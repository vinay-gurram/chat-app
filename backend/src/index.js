import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

// ✅ Import all routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import raiseHandRoutes from "./routes/raiseHand.route.js";
import feedRoutes from "./routes/feed.route.js";
import friendRoutes from "./routes/friend.route.js";
import chatUsersRoute from "./routes/chatUsers.route.js";

// ✅ Connect to MongoDB
connectDB();

// ✅ CORS Setup (no .env needed for CORS_ORIGIN)
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://chat-10rtsmtk4-vinays-projects-076db223.vercel.app",
      "https://chat-app-git-main-vinays-projects-076db223.vercel.app"
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ✅ Mount Routes
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
