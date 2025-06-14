import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// ✅ ALLOWED ORIGINS for socket
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-app-1-git-main-vinays-projects-076db223.vercel.app",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ✅ Map of userId -> socketId
const userSocketMap = {};

// ✅ Export helpers
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

export const isUserOnline = (userId) => {
  return userSocketMap.hasOwnProperty(userId);
};

// ✅ Export app/server/io
export { app, server, io };

// ✅ Socket connection
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
