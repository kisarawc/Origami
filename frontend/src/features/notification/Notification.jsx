import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Notification = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [readStatus, setReadStatus] = useState({});
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

  const markAsRead = (notificationId) => {
    setReadStatus(prev => ({
      ...prev,
      [notificationId]: true
    }));
  };

  const markAllAsRead = () => {
    const allRead = {};
    notifications.forEach(notification => {
      allRead[notification.id] = true;
    });
    setReadStatus(allRead);
  };

  const handleViewAll = () => {
    // Mark all notifications as read before navigating
    markAllAsRead();
    // Close the notification panel
    onClose();
    // Navigate to dashboard
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="fixed right-0 top-0 w-1/3 h-screen bg-gradient-to-b from-white to-gray-50 shadow-2xl border-l border-gray-200">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
            <span className="text-gray-600 text-lg font-medium">Loading notifications...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed right-0 top-0 w-1/3 h-screen bg-gradient-to-b from-white to-gray-50 shadow-2xl border-l border-gray-200">
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-3 text-red-500 bg-red-50 p-6 rounded-xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="fixed right-0 top-0 w-1/3 h-screen bg-gradient-to-b from-white to-gray-50 shadow-2xl border-l border-gray-200">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-white p-8 rounded-2xl shadow-lg relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:rotate-90"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <svg className="w-24 h-24 text-blue-100 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-xl text-gray-600 font-medium text-center">No new notifications</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 w-1/3 h-screen bg-gradient-to-b from-white to-gray-50 shadow-2xl border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-2 rounded-xl">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:rotate-90"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl shadow-sm">
            {notifications.length} new notifications
          </span>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 border border-gray-100 group hover:border-blue-100"
              onClick={handleNotificationClick}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={notification.followerAvatar || 'https://via.placeholder.com/32'}
                    alt={notification.followerUsername}
                    className="w-16 h-16 rounded-xl border-2 border-gray-200 group-hover:border-blue-200 transition-all duration-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-lg ${!readStatus[notification.id] ? 'font-bold' : 'text-gray-900'}`}>
                    <span className="font-medium text-blue-600">
                      {notification.followerUsername}
                    </span>
                    <span className="text-gray-600"> wants to follow you</span>
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm text-gray-500">
                      Click to view in dashboard
                    </p>
                    {!readStatus[notification.id] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Mark as read</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 px-8 py-6">
        <button 
          onClick={handleViewAll}
          className="w-full text-center text-base text-white bg-blue-600 hover:bg-blue-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
        >
          <span>View All in Dashboard</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Notification;
