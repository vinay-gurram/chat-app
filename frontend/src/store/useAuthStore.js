import { create } from 'zustand';
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";  
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5001"; 
export const useAuthStore = create((set,get) => ({
  authUser: null,
  isSigningIn: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,


  // ✅ CheckAuth
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket(); // 👈 Add this line to connect socket after checking auth
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
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
      toast.success("Account created successfully");
      get().connectSocket(); // 👈 Add this line to connect socket after signup
      return true;   // 👈 Add this line: return true if signup success
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Signup failed"); 
      return false;  // 👈 Add this line: return false if signup failed
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
      toast.success("Logged in successfully");
      
      get().connectSocket(); // 👈 Add this line to connect socket after login
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
      
    } finally {
      set({ isLoggingIn: false });
    }
    },

    // ✅ Logout

    logout: async() => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket(); // 👈 Add this line to disconnect socket after logout
        } catch (error) {
            toast.error("error.response.data.message");
            
        }
    },

  // ✅ Update Profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ Connect Socket

  connectSocket: () => {
    const {authUser} = get();
    if(!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL,{
      query: {
        userId: authUser._id,
      }
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds});
    });

  },
 disconnectSocket: ()=> {
  if (get().socket?.connected) {
    get().socket.disconnect();
  }
 }

}));
