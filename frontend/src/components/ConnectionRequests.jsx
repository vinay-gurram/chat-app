import React, { useState } from 'react';


const ConnectionRequests = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: 'Alice Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      skills: ['React', 'Node.js'],
      location: 'New York',
    },
    {
      id: 2,
      name: 'Bob Smith',
      avatar: 'https://i.pravatar.cc/150?img=2',
      skills: ['Python', 'Machine Learning'],
      location: 'San Francisco',
    },
  ]);

  const handleAccept = (id) => {
    alert(`Accepted request from ID ${id}`);
    setRequests(requests.filter((req) => req.id !== id));
  };

  const handleDecline = (id) => {
    alert(`Declined request from ID ${id}`);
    setRequests(requests.filter((req) => req.id !== id));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2 className="text-xl font-bold mb-4">Connection Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No new requests</p>
      ) : (
        requests.map((request) => (
          <div key={request.id} className="border rounded-lg p-4 mb-4 shadow">
            <div className="flex items-center">
              <img
                src={request.avatar}
                alt={request.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <p className="font-semibold">{request.name}</p>
                <p className="text-sm text-gray-600">
                  {request.skills.join(', ')} • {request.location}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => handleAccept(request.id)}
              >
                Accept
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => handleDecline(request.id)}
              >
                Decline
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ConnectionRequests;