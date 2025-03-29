import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FollowRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFollowRequests();
  }, []);

  const fetchFollowRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8081/api/v1/users/follow-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch follow requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching follow requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/v1/users/follow-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to accept follow request');
      }

      // Refresh the list of requests
      await fetchFollowRequests();
    } catch (err) {
      console.error('Error accepting follow request:', err);
      setError(err.message);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/v1/users/follow-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject follow request');
      }

      // Refresh the list of requests
      await fetchFollowRequests();
    } catch (err) {
      console.error('Error rejecting follow request:', err);
      setError(err.message);
    }
  };

  const handleUsernameClick = (username) => {
    navigate(`/profile/${username}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No pending follow requests
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg shadow-sm shadow-slate-300 p-3">
          <div className="flex flex-col space-y-2">
            {/* First row: Username and text */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleUsernameClick(request.followerUsername)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                {request.followerUsername}
              </button>
              <span className="text-sm text-gray-500">wants to follow you</span>
            </div>

            {/* Second row: Profile picture and buttons */}
            <div className="flex items-center">
              <div className="ml-4">
                <img
                  src={request.followerAvatar || 'https://via.placeholder.com/32'}
                  alt={request.followerUsername}
                  className="w-8 h-8 rounded-full"
                />
              </div>
              <div className="flex space-x-1 ml-12">
                <button
                  onClick={() => handleAccept(request.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FollowRequests; 