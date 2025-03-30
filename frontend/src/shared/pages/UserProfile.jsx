import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AchievementBadges from '../../features/profile/components/AchievementBadges';

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
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
  }, [userData]);

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
      setTutorials([]);
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-400 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-blue-500 hover:text-blue-600 mb-8 group"
        >
          <svg 
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Profile Header Section */}
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-8 mb-12 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            {/* Profile Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={userData.avatarUrl || 'https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg'}
                  alt={userData.username}
                  className="h-36 w-36 rounded-full border-4 border-white shadow-xl object-cover"
                />
                {userData.role === 'admin' && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    Admin
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-gray-900">{userData.name}</h1>
                  {userData.verified && (
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  )}
                </div>
                <p className="text-xl text-gray-500">@{userData.username}</p>
                {userData.bio && (
                  <p className="mt-2 text-gray-600 max-w-2xl">{userData.bio}</p>
                )}
              </div>
            </div>

            {/* Follow Button */}
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`px-8 py-3.5 rounded-full font-medium text-base transition-all transform hover:scale-105 ${
                  isFollowing === 'pending'
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : isFollowing
                    ? 'bg-gray-200 text-gray-800 hover:bg-red-500 hover:text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
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

          {/* Stats Section */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-6 max-w-3xl">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-gray-900">{userData.stats?.tutorials || 0}</div>
              <div className="text-gray-500 font-medium">Tutorials</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-gray-900">{userData.stats?.followers || 0}</div>
              <div className="text-gray-500 font-medium">Followers</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-gray-900">{userData.stats?.following || 0}</div>
              <div className="text-gray-500 font-medium">Following</div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-12">
          {userData.badges && userData.badges.length > 0 ? (
            <AchievementBadges badges={userData.badges} />
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Badges Yet</h3>
              <p className="text-gray-600">Keep interacting with the community to earn your first badge!</p>
            </div>
          )}
        </div>

        {/* Tutorials Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tutorials</h2>
          {tutorials && tutorials.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tutorials.map((tutorial) => (
                <div key={tutorial.id} className="relative aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden group hover:shadow-lg transition-all">
                  <img
                    src={tutorial.imageUrl || 'https://via.placeholder.com/300'}
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                    <h3 className="text-white font-medium">{tutorial.title}</h3>
                    <p className="text-white/80 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {tutorial.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tutorials Yet</h3>
              <p className="text-gray-600">
                {isOwnProfile 
                  ? "Share your knowledge by creating your first tutorial!"
                  : `${userData.name} hasn't created any tutorials yet.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile; 