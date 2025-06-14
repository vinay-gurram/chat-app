import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:5173"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];
export const isUserOnline = (userId) => userSocketMap.hasOwnProperty(userId);
export { app, server, io };

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
