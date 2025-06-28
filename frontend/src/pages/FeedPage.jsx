import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import NearbyUserCard from "../components/NearbyUserCard";
import { axiosInstance } from "../lib/axios";
import { motion } from "framer-motion";

const containerStyle = { width: "100%", height: "400px" };

const FeedPage = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nearbyFriends, setNearbyFriends] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCT7icnKNnHhkEzv3TUu7zJVqB7EYME4CM",
  });

  useEffect(() => {
    getCurrentLocation();
    fetchAcceptedFriends();
    fetchPendingRequests();
  }, []);

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setLocation(coords);
        handleRaiseHand(coords);
      },
      () => toast.error("Location permission denied.")
    );
  };

  const fetchAcceptedFriends = async () => {
    try {
      const res = await axiosInstance.get("/friends/accepted");
      setAcceptedFriends(res.data.friends || []);
    } catch {
      toast.error("Failed to load friends");
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axiosInstance.get("/friends/pending");
      setPendingRequests(res.data.requests || []);
    } catch {
      toast.error("Failed to load requests");
    }
  };

  const handleRaiseHand = async (coords = location) => {
    if (!coords) return;
    try {
      setLoading(true);
      const res = await axiosInstance.post("/raise-hand", coords);
      const nearby = res.data.users || [];
      const friendIds = acceptedFriends.map((f) => f._id);
      setNearbyFriends(nearby.filter((u) => friendIds.includes(u._id)));
      setNearbyUsers(nearby.filter((u) => !friendIds.includes(u._id)));
      toast.success("Nearby users loaded.");
    } catch {
      toast.error("Failed to raise hand");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (id) => {
    try {
      await axiosInstance.post("/friends/send", { friendId: id });
      toast.success("Request sent");
      handleRaiseHand();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleAccept = async (id) => {
    try {
      await axiosInstance.post("/friends/accept", { friendId: id });
      fetchAcceptedFriends();
      fetchPendingRequests();
    } catch {
      toast.error("Accept failed");
    }
  };

  const handleIgnore = async (id) => {
    try {
      await axiosInstance.post("/friends/ignore", { friendId: id });
      fetchPendingRequests();
    } catch {
      toast.error("Ignore failed");
    }
  };

  const handleUnfriend = async (id) => {
    try {
      await axiosInstance.post("/friends/unfriend", { friendId: id });
      fetchAcceptedFriends();
      handleRaiseHand();
    } catch {
      toast.error("Unfriend failed");
    }
  };

  const handleChat = (id) => navigate(`/chat/${id}`);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const toRad = (val) => (val * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 relative">
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30 pointer-events-none bg-[url('/cricket-bg-light.svg')] dark:bg-[url('/cricket-bg-dark.svg')] cricket-animated"></div>


      {pendingRequests.length > 0 && (
        <motion.div
          className="relative mb-6 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-4 py-2 bg-orange-600 rounded-lg shadow hover:bg-orange-700 transition"
          >
            🔔 {pendingRequests.length}
          </button>
          {showDropdown && (
            <div className="absolute mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <h2 className="text-lg font-semibold">Friend Requests</h2>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {pendingRequests.map((user) => (
                  <li key={user._id} className="flex items-center gap-4 p-4">
                    <img
                      src={user.profilePic || user.avatar || "/default-avatar.png"}
                      alt={user.fullName || user.username || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-grow">
                      <h3 className="text-sm font-medium">{user.fullName || user.username}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.skills?.join(", ")}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleAccept(user._id)} className="text-xs bg-green-600 px-2 py-1 rounded">
                        Accept
                      </button>
                      <button onClick={() => handleIgnore(user._id)} className="text-xs bg-red-600 px-2 py-1 rounded">
                        Ignore
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      <motion.h1
        className="text-4xl font-extrabold mb-6 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Your Friends
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12 relative z-10">
        {acceptedFriends.map((user) => (
          <motion.div
            key={user._id}
            className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow hover:shadow-lg transition relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={user.profilePic || user.avatar || "/default-avatar.png"}
              alt={user.fullName || user.username}
              className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
            />
            {user.isOnline && (
              <span className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
            )}
            <h2 className="text-center font-semibold">{user.fullName || user.username}</h2>
            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">{user.email}</p>
            <p className="text-xs text-center mt-1 text-zinc-500 dark:text-zinc-400">
              {location && user.location?.latitude && `${calculateDistance(
                location.latitude,
                location.longitude,
                user.location.latitude,
                user.location.longitude
              )} km away`}
            </p>

            <div className="mt-3 flex justify-center gap-2">
              <button onClick={() => handleChat(user._id)} className="text-sm bg-blue-600 px-3 py-1 rounded">
                Chat
              </button>
              <button onClick={() => handleUnfriend(user._id)} className="text-sm bg-red-600 px-3 py-1 rounded">
                Unfriend
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {location && isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: location.latitude, lng: location.longitude }}
          zoom={13}
        >
          <Marker
            position={{ lat: location.latitude, lng: location.longitude }}
            label="You"
            icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
          />
          {nearbyFriends.map((user) => (
            <Marker
              key={user._id}
              position={{ lat: user.location?.latitude, lng: user.location?.longitude }}
              label={user.fullName || user.username}
              icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }}
            />
          ))}
          {nearbyUsers.map((user) => (
            <Marker
              key={user._id}
              position={{ lat: user.location?.latitude, lng: user.location?.longitude }}
              label={user.fullName || user.username}
              icon={{ url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
            />
          ))}
        </GoogleMap>
      )}

      <motion.h2
        className="text-2xl font-bold mt-10 mb-4 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Nearby Users
      </motion.h2>
      {nearbyUsers.length === 0 ? (
        <p className="text-zinc-500">No users found nearby.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
          {nearbyUsers.map((user) => (
            <NearbyUserCard
              key={user._id}
              user={user}
              onSendRequest={() => handleSendRequest(user._id)}
              onUnfriend={() => handleUnfriend(user._id)}
              onChat={() => handleChat(user._id)}
              isFriend={acceptedFriends.some((f) => f._id === user._id)}
              isPending={pendingRequests.some((p) => p._id === user._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
