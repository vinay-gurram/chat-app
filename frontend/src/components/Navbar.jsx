import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  MessageSquare,
  Settings,
  User,
  LogOut,
  Home,
  MessageCircle,
} from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/feed")} className="flex items-center gap-2.5 hover:opacity-80">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 relative">
            <button onClick={() => navigate("/feed")} className="btn btn-sm btn-outline gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button onClick={() => navigate("/chat")} className="btn btn-sm btn-outline gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </button>

            <button onClick={() => navigate("/settings")} className="btn btn-sm gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {authUser && (
              <>
                <button onClick={() => navigate("/profile")} className="btn btn-sm gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
                <button
                  onClick={logout}
                  className="flex gap-2 items-center btn btn-sm"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
