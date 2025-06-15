import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// ✅ Full list of allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-app-git-main-vinays-projects-076db223.vercel.app",
  "https://chat-10rtsmtk4-vinays-projects-076db223.vercel.app"
];

// ✅ Proper CORS setup for socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ✅ Map of connected users
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];
export const isUserOnline = (userId) => userSocketMap.hasOwnProperty(userId);
export { app, server, io };

// ✅ On socket connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`✅ User connected: ${userId}`);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log(`❌ User disconnected: ${userId}`);
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});
