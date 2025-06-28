import React from "react";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
//import defaultAvatar from "../assets/default-avatar.png"; // Add a default image

const HomePage = () => {
  const { authUser } = useAuthStore();
  const [nearbyUsers, setNearbyUsers] = useState([]);

  const fetchNearbyUsers = async (lat, lng) => {
    try {
      const { data } = await axiosInstance.post("/raise-hand", {
        latitude: lat,
        longitude: lng,
      });
      setNearbyUsers(data.users);
    } catch (err) {
      toast.error("Failed to fetch nearby users");
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        fetchNearbyUsers(lat, lng);
      },
      err => toast.error("Location access denied")
    );
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="bg-blue-200 p-4 rounded mb-6 text-center">
        <h1 className="text-xl font-semibold">Find Your Cricket Bros</h1>
      </div>

      <h2 className="text-lg font-medium text-center mb-6">
        Hello {authUser?.fullName?.split(" ")[0]}, find your Cricket Bros Here
      </h2>

      <div className="flex flex-wrap justify-center gap-6">
        {nearbyUsers.length === 0 ? (
          <p className="text-center text-gray-600">No nearby users found.</p>
        ) : (
          nearbyUsers.map(user => (
            <div
              key={user._id}
              className="bg-white shadow-md p-6 rounded-lg w-72 flex flex-col items-center text-center"
            >
              <img
                src={user.avatar || defaultAvatar}
                alt="avatar"
                className="w-20 h-20 rounded-full mb-4"
              />
              <h3 className="text-lg font-semibold">{user.fullName}</h3>
              <p className="text-gray-500">@{user.username}</p>
              <p className="text-blue-700 font-medium mt-1">{user.gender}</p>
              <p className="text-sm text-gray-600 mt-2">{user.bio}</p>

              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {user.skills?.map(skill => (
                  <span
                    key={skill}
                    className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex gap-4 mt-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded">
                  Interested
                </button>
                <button className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-1 rounded">
                  Ignore
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;