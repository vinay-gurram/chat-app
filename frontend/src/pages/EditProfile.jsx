import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore"; // 🔄 Import Zustand

const EditProfile = () => {
  const { user, setUser } = useAuthStore(); // 🔥 Zustand state
  const [fullName, setFullName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [skills, setSkills] = useState("");

  // 🔄 Load current user info
  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/auth/me", {
        withCredentials: true,
      });
      const user = res.data;
      setFullName(user.fullName || "");
      setProfilePic(user.profilePic || "");
      setSkills(user.skills?.join(", ") || "");
      setUser(user); // 🔥 update Zustand
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔄 Save updated profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillArray = skills.split(",").map((s) => s.trim()).filter(Boolean);

      const res = await axios.put(
        "http://localhost:5001/api/auth/update",
        {
          fullName,
          profilePic,
          skills: skillArray,
        },
        { withCredentials: true }
      );

      alert("✅ Profile updated");
      fetchProfile(); // 🔄 Refresh local
    } catch (err) {
      console.error("Update failed", err.response?.data || err.message);
      alert("❌ Failed to update profile.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Profile Pic URL"
          value={profilePic}
          onChange={(e) => setProfilePic(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Skills (comma separated)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
