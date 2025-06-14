import React, { useState } from "react";

const EditProfile = () => {
  const [fullName, setFullName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send updated profile to backend here
    console.log("Updating profile:", { fullName, profilePic });
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
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
