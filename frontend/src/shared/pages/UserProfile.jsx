import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

// Format the date - handle both ISO string and MongoDB LocalDateTime format
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';

  // Directly check for the problematic date format
  if (dateString === '0-01-01 00:00:00') {
    return 'Recently';
  }

  try {
    // For debugging
    console.log('Date input:', typeof dateString, dateString);

    // Parse the date string
    let date;

    // Handle array format from Java LocalDateTime
    if (Array.isArray(dateString)) {
      // Format: [year, month, day, hour, minute, second, nano]
      const [year, month, day, hour, minute, second] = dateString;
      // Note: month in JavaScript Date is 0-indexed, but Java's is 1-indexed
      date = new Date(year, month - 1, day, hour, minute, second);
    }
    // Handle object format from Java LocalDateTime
    else if (typeof dateString === 'object' && dateString !== null && !Array.isArray(dateString)) {
      const year = dateString.year || 0;
      const month = dateString.monthValue || 1;
      const day = dateString.dayOfMonth || 1;
      const hour = dateString.hour || 0;
      const minute = dateString.minute || 0;
      const second = dateString.second || 0;

      // Month is 0-indexed in JavaScript Date
      date = new Date(year, month - 1, day, hour, minute, second);
    }
    // Handle ISO format strings with timezone like "2025-05-09T16:11:15.622+00:00"
    else if (typeof dateString === 'string' && dateString.includes('T') && dateString.includes('+')) {
      date = new Date(dateString);
    }
    // Handle ISO format strings
    else if (typeof dateString === 'string' && (dateString.includes('T') || dateString.includes('Z'))) {
      date = new Date(dateString);
    }
    // Handle format like "2023-06-15 14:30:00"
    else if (typeof dateString === 'string' && dateString.includes('-') && dateString.includes(':')) {
      date = new Date(dateString.replace(' ', 'T') + 'Z');
    }
    // Handle invalid date format like "0-01-01 00:00:00" or any date starting with "0-"
    else if (typeof dateString === 'string' && dateString.startsWith('0-')) {
      // Use "Recently" as fallback for invalid dates
      return 'Recently';
    }
    else {
      // Try direct parsing as last resort
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error, dateString);

    // For debugging
    if (typeof dateString === 'object') {
      console.log('Date object:', JSON.stringify(dateString));
    }

    // Return a reasonable fallback
    return 'Recently';
  }
};

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('completed');
  const [creations, setCreations] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [completedTutorials, setCompletedTutorials] = useState([]);
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
    setIsContentLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (activeTab === 'creations') {
        // For now, we'll just show empty states for creations
        setCreations([]);
      } else if (activeTab === 'tutorials') {
        // Fetch tutorials by username
        const response = await fetch(`http://localhost:8081/api/v1/tutorials/user/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          handleAuthError(response);
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch tutorials');
        }

        const data = await response.json();
        setTutorials(data);
      } else if (activeTab === 'completed') {
        // Fetch completed tutorials for the specific user
        console.log(`Fetching completed tutorials for user: ${username}`);
        const response = await fetch(`http://localhost:8081/api/v1/completed-tutorials/user/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          handleAuthError(response);
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch completed tutorials');
        }

        const data = await response.json();
        console.log('Completed tutorials:', data);
        setCompletedTutorials(data);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      if (err.message !== 'Failed to fetch') {
        setError(err.message);
      }
    } finally {
      setIsContentLoading(false);
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
              <button
                onClick={() => setActiveTab('completed')}
                className={`${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Completed
              </button>
            </nav>
          </div>
          <div className="p-6">
            {isContentLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : activeTab === 'creations' ? (
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
            ) : activeTab === 'tutorials' ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tutorials.length > 0 ? (
                    tutorials.map((tutorial) => (
                      <div key={tutorial.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={tutorial.finalImage || 'https://via.placeholder.com/300?text=No+Image'}
                            alt={tutorial.title}
                            className="w-full h-48 object-cover"
                          />
                          {tutorial.stepImages && tutorial.stepImages.length > 0 && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              {tutorial.stepImages.length} steps
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900">{tutorial.title}</h3>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{tutorial.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                {tutorial.difficulty}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {tutorial.category}
                              </span>
                            </div>
                            <button
                              onClick={() => navigate(`/tutorials/${tutorial.id}`)}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                            >
                              View
                            </button>
                          </div>
                          {tutorial.createdAt && (
                            <div className="mt-2 text-xs text-gray-400">
                              Created {formatDate(tutorial.createdAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-12 text-center">
                      <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <p className="text-gray-500 mb-2">No tutorials found</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {isOwnProfile && (
                  <div className="mb-6 flex justify-end">
                    <button
                      onClick={() => navigate('/tutorials')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Browse More Tutorials</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedTutorials.length > 0 ? (
                    completedTutorials.map((completed) => (
                      <div key={completed.id || `${completed.tutorialId}-${completed.userUsername}`} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={completed.completionImage || 'https://via.placeholder.com/300?text=No+Image'}
                            alt={completed.tutorialTitle}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Completed
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900">{completed.tutorialTitle || 'Completed Tutorial'}</h3>
                          {completed.tutorialDescription && (
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{completed.tutorialDescription}</p>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              {completed.tutorialDifficulty && (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  {completed.tutorialDifficulty}
                                </span>
                              )}
                              {completed.tutorialCategory && (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  {completed.tutorialCategory}
                                </span>
                              )}
                              {completed.tutorialAuthorUsername && (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {completed.tutorialAuthorUsername}
                                </span>
                              )}
                            </div>
                            {completed.tutorialId && (
                              <button
                                onClick={() => navigate(`/tutorials/${completed.tutorialId}`)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                              >
                                View
                              </button>
                            )}
                          </div>

                          {/* Add links to tutorial and author */}
                          <div className="mt-4 flex justify-between items-center">
                            {completed.tutorialAuthorUsername && completed.tutorialAuthorUsername !== username && (
                              <button
                                onClick={() => navigate(`/profile/${completed.tutorialAuthorUsername}`)}
                                className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                              >
                                View Author
                              </button>
                            )}
                            {completed.tutorialId && (
                              <button
                                onClick={() => navigate(`/tutorials/${completed.tutorialId}`)}
                                className={`text-sm text-blue-500 hover:text-blue-700 transition-colors ${!completed.tutorialAuthorUsername || completed.tutorialAuthorUsername === username ? 'ml-auto' : ''}`}
                              >
                                View Tutorial
                              </button>
                            )}
                          </div>
                          {completed.completedAt && (
                            <div className="mt-2 text-xs text-gray-400">
                              Completed on {formatDate(completed.completedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-12 text-center">
                      <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 mb-2">No completed tutorials found</p>
                      {isOwnProfile && (
                        <div className="mt-4">
                          <button
                            onClick={() => navigate('/tutorials')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Browse Tutorials
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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