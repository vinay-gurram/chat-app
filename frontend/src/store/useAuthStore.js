import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningIn: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  pendingRequests: [],

  // ✅ Check if user is already logged in
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
      get().fetchPendingRequests(); // Fetch on auth check
    } catch (err) {
      set({ authUser: null });
      console.error("checkAuth failed:", err);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ Signup
  signup: async (data) => {
    set({ isSigningIn: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Account created successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
      return false;
    } finally {
      set({ isSigningIn: false });
    }
  },

  // ✅ Login
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      window.hasRedirected = false;
      get().connectSocket();
      get().fetchPendingRequests(); // Fetch after login
      toast.success("Logged in successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // ✅ Logout
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, pendingRequests: [] });
      get().disconnectSocket();
      toast.success("Logged out");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  },

  // ✅ Update profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ Connect socket.io client
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
      withCredentials: true,
    });

    newSocket.connect();
    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  // ✅ Disconnect socket.io
  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },

  // ✅ Fetch Pending Friend Requests
  fetchPendingRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/pending");
      set({ pendingRequests: res.data.requests || [] }); // ✅ Already populated from backend
    } catch {
      toast.error("Failed to load requests");
    }
  },

  // ✅ Accept Friend Request
  acceptFriendRequest: async (friendId) => {
    try {
      await axiosInstance.post("/friends/accept", { friendId });
      get().fetchPendingRequests(); // Refresh list
      toast.success("Friend request accepted");
    } catch {
      toast.error("Accept failed");
    }
  },

  // ✅ Ignore Friend Request
  ignoreFriendRequest: async (friendId) => {
    try {
      await axiosInstance.post("/friends/ignore", { friendId });
      get().fetchPendingRequests(); // Refresh list
      toast.success("Friend request ignored");
    } catch {
      toast.error("Ignore failed");
    }
  },
}));
