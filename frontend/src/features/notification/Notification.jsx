import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Notification = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    // Set up polling to check for updates every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
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
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = () => {
    navigate('/dashboard');
    onClose();
  };

  const removeNotification = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  // Listen for custom event when a follow request is handled
  useEffect(() => {
    const handleFollowRequestHandled = (event) => {
      const { requestId } = event.detail;
      removeNotification(requestId);
    };

    window.addEventListener('followRequestHandled', handleFollowRequestHandled);
    return () => {
      window.removeEventListener('followRequestHandled', handleFollowRequestHandled);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg border border-red-200">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-200">
        <p className="text-gray-500 text-sm text-center">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
          <span className="text-xs text-gray-500">{notifications.length} new</span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-100">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-l-transparent hover:border-l-blue-500"
            onClick={handleNotificationClick}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <img
                  src={notification.followerAvatar || 'https://via.placeholder.com/32'}
                  alt={notification.followerUsername}
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium text-blue-600">
                    {notification.followerUsername}
                  </span>
                  <span className="text-gray-600"> wants to follow you</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click to view in dashboard
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-2">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
        >
          View All in Dashboard
        </button>
      </div>
    </div>
  );
};

export default Notification;
