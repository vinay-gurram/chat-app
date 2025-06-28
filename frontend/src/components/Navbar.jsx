import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogOut,
  CircleUserRound,
  HomeIcon,
  MessagesSquare,
  SlidersHorizontal,
} from "lucide-react";
import React from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", icon: <HomeIcon className="w-5 h-5" />, path: "/feed" },
    { label: "Chat", icon: <MessagesSquare className="w-5 h-5" />, path: "/chat" },
    { label: "Settings", icon: <SlidersHorizontal className="w-5 h-5" />, path: "/settings" },
    ...(authUser
      ? [
          {
            label: "Profile",
            icon: <CircleUserRound className="w-5 h-5" />,
            path: "/profile",
          },
          {
            label: "Logout",
            icon: <LogOut className="w-5 h-5" />,
            onClick: logout,
            style: "text-red-500 hover:bg-red-100",
          },
        ]
      : []),
  ];

  return (
    <header className="fixed top-0 z-50 w-full bg-base-100/80 backdrop-blur-lg shadow-md border-b border-base-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate("/feed")} className="flex items-center gap-5">
          <img
            src="/logo_cricket.png"
            alt="Logo"
            className="w-29 h-16 object-contain rounded-full animate-bounce"
          />
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-bounce">
  CRICK-BROS
</h1>

        </button>

        {/* Nav Buttons */}
        <div className="flex items-center gap-2">
          {navItems.map(({ label, icon, path, onClick, style }) => (
            <button
              key={label}
              onClick={onClick || (() => navigate(path))}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 
                bg-gray-900 text-white shadow-lg hover:shadow-xl
                hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 
                hover:text-black transition-all duration-300 ${
                  style || ""
                }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
