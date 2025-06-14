import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import NearbyUserCard from "../components/NearbyUserCard";
import { axiosInstance } from "../lib/axios";

const containerStyle = {
  width: "100%",
  height: "400px",
};

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
      (err) => {
        toast.error("Location permission denied.");
        console.error(err);
      }
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
      const extracted = (res.data.requests || []).map((r) => r.user);
      setPendingRequests(extracted);
    } catch (err) {
      toast.error("Failed to load friend requests");
    }
  };

  const handleRaiseHand = async (coords = location) => {
    if (!coords) return toast.error("Location not ready");
    try {
      setLoading(true);
      const res = await axiosInstance.post("/raise-hand", coords);
      toast.success("Hand raised! Nearby users loaded.");
      const nearby = res.data.users || [];
      const friendIds = acceptedFriends.map((f) => f._id);
      setNearbyFriends(nearby.filter((u) => friendIds.includes(u._id)));
      setNearbyUsers(nearby.filter((u) => !friendIds.includes(u._id)));
    } catch (err) {
      toast.error("Failed to raise hand");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (id) => {
    if (!id) return toast.error("Invalid user");
    try {
      await axiosInstance.post("/friends/send", { friendId: id });
      toast.success("Request sent");
      handleRaiseHand();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleAccept = async (id) => {
    try {
      await axiosInstance.post("/friends/accept", { friendId: id });
      toast.success("Accepted friend request");
      fetchAcceptedFriends();
      fetchPendingRequests();
    } catch {
      toast.error("Accept failed");
    }
  };

  const handleIgnore = async (id) => {
    try {
      await axiosInstance.post("/friends/ignore", { friendId: id });
      toast.success("Ignored request");
      fetchPendingRequests();
    } catch {
      toast.error("Ignore failed");
    }
  };

  const handleUnfriend = async (id) => {
    try {
      await axiosInstance.post("/friends/unfriend", { friendId: id });
      toast.success("Unfriended");
      fetchAcceptedFriends();
      handleRaiseHand();
    } catch {
      toast.error("Failed to unfriend");
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
    <div className="max-w-5xl mx-auto p-6 text-white">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Connections</h1>
      </div>

      {/* Friend Requests */}
      {pendingRequests.length > 0 && (
        <div className="relative mb-6">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="btn btn-outline"
          >
            🔔 {pendingRequests.length}
          </button>
          {showDropdown && (
            <div className="absolute mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-zinc-700">
                <h2 className="text-lg font-semibold text-white">Friend Requests</h2>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {pendingRequests.map((user) => (
                  <li
                    key={user._id}
                    className="flex items-center gap-4 p-4 border-b border-zinc-800 hover:bg-zinc-800"
                  >
                    <img
                      src={user.avatar || user.profilePic || "/default-avatar.png"}
                      alt={user.username || user.fullName || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-grow">
                      <h3 className="text-white text-sm font-medium">
                        {user.username || user.fullName || "Unknown"}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleAccept(user._id)}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleIgnore(user._id)}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                      >
                        Ignore
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Accepted Friends */}
      {acceptedFriends.length === 0 ? (
        <p className="text-gray-400">No accepted friends yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {acceptedFriends.map((user) => (
            <div
              key={user._id}
              className="bg-zinc-800 p-4 rounded-lg shadow-md text-center relative animate-fadeIn"
            >
              <img
                src={user.avatar || user.profilePic || "/default-avatar.png"}
                alt={user.username || user.fullName || "User"}
                className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
              />
              {user.isOnline && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
              )}
              <h2 className="text-lg font-semibold">
                {user.username || user.fullName || "Unknown"}
              </h2>
              {location && user.location?.latitude && (
                <p className="text-xs text-zinc-400">
                  {calculateDistance(
                    location.latitude,
                    location.longitude,
                    user.location.latitude,
                    user.location.longitude
                  )} km away
                </p>
              )}
              <div className="mt-3 flex justify-center gap-2">
                <button
                  onClick={() => handleChat(user._id)}
                  className="btn btn-sm bg-green-600 text-white"
                >
                  Chat
                </button>
                <button
                  onClick={() => handleUnfriend(user._id)}
                  className="btn btn-sm bg-red-600 text-white"
                >
                  Unfriend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map */}
      {location && isLoaded && (
        <div className="w-full h-[400px] mt-6 mb-10">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: location.latitude, lng: location.longitude }}
            zoom={13}
          >
            <Marker
              position={{ lat: location.latitude, lng: location.longitude }}
              label="You"
            />
            {nearbyFriends.concat(nearbyUsers).map((user) => (
              <Marker
                key={user._id}
                position={{
                  lat: user.location?.latitude,
                  lng: user.location?.longitude,
                }}
                label={user.username || user.name || "User"}
              />
            ))}
          </GoogleMap>
        </div>
      )}

      {/* Nearby Users */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">Nearby Users</h2>
      {nearbyUsers.length === 0 ? (
        <p className="text-gray-400">No nearby users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nearbyUsers.map((user) => (
            <NearbyUserCard
              key={user._id}
              user={user}
              onSendRequest={handleSendRequest}
              onAccept={handleAccept}
              onIgnore={handleIgnore}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
