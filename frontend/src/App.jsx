// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

import Navbar from "./components/Navbar";
import FeedPage from "./pages/FeedPage"; 
import ConnectionRequests from "./components/ConnectionRequests";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import EditProfile from "./pages/EditProfile";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth(); // ✅ check cookie
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <div className="pt-16 px-4">
        <Routes>
          <Route path="/" element={authUser ? <FeedPage /> : <Navigate to="/login" />} />
          <Route path="/feed" element={authUser ? <FeedPage /> : <Navigate to="/login" />} />
          <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
          <Route path="/chat/:id" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
          <Route path="/home" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/requests" element={authUser ? <ConnectionRequests /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/feed" />} />
          <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/edit-profile" element={authUser ? <EditProfile /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Toasts */}
        <Toaster />
        <ToastContainer />
      </div>
    </div>
  );
};

export default App;
