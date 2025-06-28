import React, { useState } from "react";
import axios from "axios";

const EditProfile = () => {
  const [fullName, setFullName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [skills, setSkills] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        "http://localhost:5001/api/auth/update",
        {
          fullName,
          avatar: profilePic,
          skills: skills.split(",").map((s) => s.trim()),
        },
        {
          withCredentials: true,
        }
      );

      console.log("✅ Profile updated:", res.data.user);
    } catch (err) {
      console.error("❌ Update failed:", err);
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
