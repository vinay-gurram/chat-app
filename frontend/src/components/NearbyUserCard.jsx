import React from "react";

const NearbyUserCard = ({
  user,
  onSendRequest,
  onUnfriend,
  onChat,
  isFriend = false,
}) => {
  const {
    avatar,
    fullName,
    username,
    name,
    skills = [],
    isOnline,
    distance,
    _id,
  } = user;

  const displayName = name || username || fullName || "Unknown";

  return (
    <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg text-center animate-fadeIn">
      <img
        src={avatar || "/default-avatar.png"}
        alt="User Avatar"
        className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
      />

      <h3 className="text-lg font-semibold text-white">{displayName}</h3>

      <div className="text-sm mb-2">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            isOnline ? "bg-green-600 text-white" : "bg-gray-600 text-white"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>

      {skills.length > 0 && (
        <p className="text-sm text-gray-400 mb-2">
          Skills: {skills.join(", ")}
        </p>
      )}

      {distance && (
        <p className="text-sm text-gray-400 mb-2">
          📍 {parseFloat(distance).toFixed(2)} km away
        </p>
      )}

      <div className="flex justify-center gap-2 mt-4">
        {isFriend ? (
          <>
            <button
              onClick={onChat}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
            >
              Chat
            </button>
            <button
              onClick={onUnfriend}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
            >
              Unfriend
            </button>
          </>
        ) : (
          <button
            onClick={() => onSendRequest(_id)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
          >
            Send Friend Request
          </button>
        )}
      </div>
    </div>
  );
};

export default NearbyUserCard;
