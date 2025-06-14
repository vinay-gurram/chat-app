import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, MapPin } from "lucide-react";

const skillOptions = ["Batting", "Bowling", "Fielding", "Wicketkeeping", "All the above"];

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState(["", "", "", ""]);
  const [location, setLocation] = useState({ latitude: "", longitude: "", address: "" });

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || "");
      setEmail(authUser.email || "");
      setSkills(authUser.skills || ["", "", "", ""]);
      setLocation(authUser.location || { latitude: "", longitude: "", address: "" });
    }
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);

      const updatedUser = await updateProfile({ profilePic: base64Image });
      if (updatedUser) {
        useAuthStore.setState({ authUser: { ...updatedUser } });
      }
    };
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const address = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
        setLocation({ latitude, longitude, address });
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const handleSave = async () => {
    const updatedUser = await updateProfile({ fullName, email, skills, location });
    if (updatedUser) {
      useAuthStore.setState({ authUser: updatedUser });
      alert("Profile updated!");
      setEditMode(false);
    }
  };

  if (!authUser) {
    return <p className="text-center mt-10">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-3xl mx-auto bg-base-300 p-6 rounded-xl shadow space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">👤 Your Profile</h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-primary text-white px-4 py-1.5 rounded hover:bg-primary-focus text-sm"
          >
            {editMode ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={selectedImg || authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="size-32 rounded-full object-cover border-4"
            />
            {editMode && (
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content p-2 rounded-full cursor-pointer ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            )}
          </div>
        </div>

        {!editMode ? (
          // View Mode
          <div className="text-lg space-y-2 px-2">
            <p>
              <strong>Full Name:</strong> {authUser.fullName}
            </p>
            <p>
              <strong>Email:</strong> {authUser.email}
            </p>
            <p>
              <strong>Skills:</strong>{" "}
              {authUser.skills?.length > 0 ? authUser.skills.join(", ") : "No skills added"}
            </p>
            <p>
              <strong>Location:</strong>{" "}
              {authUser.location?.address
                ? `${authUser.location.address} (${authUser.location.latitude?.toFixed(4)}, ${authUser.location.longitude?.toFixed(4)})`
                : "Not set"}
            </p>
            <p>
              <strong>Joined On:</strong> {new Date(authUser.createdAt).toLocaleDateString()}
            </p>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400 flex items-center gap-2"><User className="w-4 h-4" /> Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-base-200 rounded-lg border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-base-200 rounded-lg border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">Top 4 Skills</label>
              {skills.map((skill, index) => (
                <select
                  key={index}
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  className="w-full px-4 py-2.5 bg-base-200 rounded-lg border"
                >
                  <option value="">Select Skill {index + 1}</option>
                  {skillOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> Current Location</label>
                <button onClick={fetchLocation} className="text-sm text-blue-500 underline">Detect</button>
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {location.address || "Not set"}
              </p>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
