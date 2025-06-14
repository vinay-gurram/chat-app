import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import raiseHandRoutes from "./routes/raiseHand.route.js";
import feedRoutes from "./routes/feed.route.js";
import friendRoutes from "./routes/friend.route.js";
import chatUsersRoute from "./routes/chatUsers.route.js";


// Socket and Express App
import { app, server } from "./lib/socket.js";

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5001;

// ✅ Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // ⚠️ Replace with frontend URL in production
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ✅ API Routes
app.use("/api/auth", authRoutes);           //  Auth (Register, Login)
app.use("/api/messages", messageRoutes);    //  Messages
app.use("/api/raise-hand", raiseHandRoutes); //  Raise Hand
app.use("/api/feed", feedRoutes);           //  Feed (Nearby users)
app.use("/api/friends", friendRoutes);      //  Friends (Send/Accept/Ignore)
app.use("/api/chat-users", chatUsersRoute); //  Chat Users (Get online users)

// ✅ Start Server + Connect DB
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  connectDB(); // ⛓️ Connect MongoDB
});