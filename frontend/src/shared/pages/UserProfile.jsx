import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('creations');
  const [creations, setCreations] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
  }, [username, navigate]);

  useEffect(() => {
    if (userData) {
      fetchUserContent();
    }
  }, [userData, activeTab]);

  const handleAuthError = (response) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/login');
    }
  };

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8081/api/v1/users/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      handleAuthError(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user profile');
      }

      const data = await response.json();
      setUserData(data);
      setIsOwnProfile(data.username === localStorage.getItem('username'));
      
      // Check follow request status
      const followStatusResponse = await fetch(`http://localhost:8081/api/v1/users/${username}/follow-request-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (followStatusResponse.ok) {
        const statusData = await followStatusResponse.json();
        if (statusData.status === 'own_profile') {
          setIsFollowing(false);
        } else if (statusData.status === 'following') {
          setIsFollowing(true);
        } else if (statusData.status === 'pending') {
          setIsFollowing('pending');
        } else {
          setIsFollowing(false);
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserContent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // For now, we'll just show empty states since the endpoints are not implemented
      if (activeTab === 'creations') {
        setCreations([]);
      } else {
        setTutorials([]);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      if (err.message !== 'Failed to fetch') {
        setError(err.message);
      }
    }
  };

  const handleFollowToggle = async () => {
    setIsFollowLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (isFollowing === 'pending') {
        // If there's a pending request, we don't need to do anything
        return;
      }

      if (isFollowing) {
        // Unfollow action
        const response = await fetch(`http://localhost:8081/api/v1/users/${username}/follow`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        handleAuthError(response);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to unfollow user');
        }

        // Update UI state immediately
        setIsFollowing(false);
        setUserData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: Math.max(0, prev.stats.followers - 1)
          }
        }));
      } else {
        // Follow action
        const response = await fetch(`http://localhost:8081/api/v1/users/${username}/follow`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        handleAuthError(response);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to follow user');
        }

        // Update UI state immediately
        setIsFollowing('pending');
        setUserData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers + 1
          }
        }));
      }

      // Refresh user profile data to ensure everything is in sync
      await fetchUserProfile();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
    <div className="min-h-screen bg-gray-50">
      <Header />
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Profile Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={userData.avatarUrl || 'https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg'}
                alt={userData.username}
                className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                <p className="text-gray-500">@{userData.username}</p>
                {userData.bio && (
                  <p className="mt-1 text-gray-600">{userData.bio}</p>
                )}
              </div>
            </div>
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isFollowing === 'pending'
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : isFollowing
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : isFollowing === 'pending' ? (
                  'Request Sent'
                ) : isFollowing ? (
                  'Unfollow'
                ) : (
                  'Follow'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userData.stats?.creations || 0}</div>
              <div className="text-sm text-gray-500">Creations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userData.stats?.followers || 0}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userData.stats?.following || 0}</div>
              <div className="text-sm text-gray-500">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('creations')}
                className={`${
                  activeTab === 'creations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Creations
              </button>
              <button
                onClick={() => setActiveTab('tutorials')}
                className={`${
                  activeTab === 'tutorials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Tutorials
              </button>
            </nav>
          </div>
          <div className="p-6">
            {activeTab === 'creations' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creations.map((creation) => (
                  <div key={creation.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <img
                      src={creation.imageUrl || 'https://via.placeholder.com/300'}
                      alt={creation.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">{creation.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{creation.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tutorial) => (
                  <div key={tutorial.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <img
                      src={tutorial.imageUrl || 'https://via.placeholder.com/300'}
                      alt={tutorial.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">{tutorial.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{tutorial.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      {userData.badges && userData.badges.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {userData.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <img
                    src={badge.icon}
                    alt={badge.name}
                    className="w-8 h-8 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{badge.name}</div>
                    <div className="text-sm text-gray-500">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}

export default UserProfile; 