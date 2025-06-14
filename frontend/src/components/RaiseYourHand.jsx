import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Hand } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const RaiseYourHand = () => {
  const [usersNearby, setUsersNearby] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const { token } = useAuthStore(); // Optional if you need token

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCT7icnKNnHhkEzv3TUu7zJVqB7EYME4CM",
  });

  // Get current location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        toast.error("Unable to access location");
        console.error("Geolocation error:", error);
      }
    );
  }, []);

  // Raise hand and get nearby users
  const handleRaiseHand = async () => {
    if (!location.lat || !location.lng) {
      toast.error("Location not available yet.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5001/api/raise-hand",
        {
          latitude: location.lat,
          longitude: location.lng,
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // optional if protected
          withCredentials: true,
        }
      );

      console.log("Nearby Users Response:", JSON.stringify(res.data, null, 2));

      setUsersNearby(res.data.users || []);
      setCount(res.data.users?.length || 0);
      toast.success("Hand raised! Showing users nearby...");
    } catch (err) {
      console.error("Raise hand error:", err);
      toast.error(err.response?.data?.message || "Failed to raise hand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center py-8 space-y-6">
      <button
        onClick={handleRaiseHand}
        className="btn btn-primary flex items-center gap-2 mx-auto"
      >
        <Hand size={18} />
        Raise Your Hand
      </button>

      <p className="text-green-500 font-medium mt-4">
        GET THE PLAYERS AND HAVE FUN
      </p>

      {loading && <p className="text-zinc-400">Finding nearby users...</p>}

      {!loading && count > 0 && (
        <>
          <p className="text-green-500 font-medium mt-4">
            👋 {count} users raised hands near you (within 5km)
          </p>

          {/* Google Map */}
          <div className="w-full h-[400px] mt-6">
            {isLoaded && location.lat && location.lng ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={location}
                zoom={13}
              >
                {/* Your Location Marker */}
                <Marker position={location} label="You" />

                {/* Nearby Users Markers */}
                {usersNearby.map((user) => (
                  <Marker
                    key={user._id}
                    position={{
                      lat: user.location?.latitude,
                      lng: user.location?.longitude,
                    }}
                    label={user.name}
                  />
                ))}
              </GoogleMap>
            ) : (
              <p className="text-zinc-400">Loading map...</p>
            )}
          </div>

          {/* Nearby User Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 px-4">
            {usersNearby.map((user) => (
              <div
                key={user._id}
                className="bg-base-200 p-4 rounded-lg shadow flex items-center gap-4"
              >
                <img
                  src={user.avatar || "/default.png"}
                  className="w-12 h-12 rounded-full object-cover"
                  alt={user.name}
                />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-zinc-400">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RaiseYourHand;
