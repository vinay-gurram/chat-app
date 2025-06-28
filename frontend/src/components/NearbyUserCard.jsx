import { useEffect, useState } from "react";
import { MessageCircle, UserMinus, UserPlus2 } from "lucide-react";

const NearbyUserCard = ({
  user,
  onSendRequest,
  onUnfriend,
  onChat,
  isFriend,
  isPending,
}) => {
  const {
    fullName = "Unknown User",
    skills = [],
    profilePic,
    avatar,
  } = user;

  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (isFriend) {
      setJustAdded(true);
      const timeout = setTimeout(() => setJustAdded(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [isFriend]);

  const imageUrl = profilePic || avatar || "/default-avatar.png";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md transition-transform hover:scale-[1.02]">
      {/* Profile Info */}
      <div className="flex items-center space-x-4">
        <img
          src={imageUrl}
          alt="Profile"
          className="w-14 h-14 rounded-full object-cover border"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {fullName}
          </h3>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Skills:</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between items-center">
        {isFriend ? (
          <>
            <button
              onClick={onChat}
              className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
            >
              <MessageCircle size={16} /> Chat
            </button>
            <button
              onClick={onUnfriend}
              className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
            >
              <UserMinus size={16} /> Unfriend
            </button>
            {justAdded && (
              <span className="text-sm text-green-600 font-bold animate-pulse ml-2">
                Added 🎉
              </span>
            )}
          </>
        ) : isPending ? (
          <button
            disabled
            className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm w-full text-center animate-pulse cursor-not-allowed"
          >
            Pending...
          </button>
        ) : (
          <button
            onClick={onSendRequest}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 w-full justify-center hover:bg-blue-700"
          >
            <UserPlus2 size={16} /> Add Friend
          </button>
        )}
      </div>
    </div>
  );
};

export default NearbyUserCard;
