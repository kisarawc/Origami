import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header';
import Footer from '../../shared/components/Footer';
import Modal from '../../shared/components/Modal';
import { motion } from 'framer-motion';
import AchievementBadges from './components/AchievementBadges';
import MyCreations from './components/MyCreations';

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('creations');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatarUrl: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const response = await fetch(`http://localhost:8081/api/v1/users/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setEditFormData({
          username: data.username,
          email: data.email,
          bio: data.bio || '',
          avatarUrl: data.avatarUrl || ''
        });
      } else {
        setError('Failed to fetch user profile');
      }
    } catch (err) {
      setError('An error occurred while fetching profile');
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!editFormData.username.trim()) {
      errors.username = 'Username is required';
    } else if (editFormData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    } else if (editFormData.username.length > 20) {
      errors.username = 'Username must be less than 20 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(editFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Bio validation
    if (editFormData.bio && editFormData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    // Profile picture URL validation
    if (editFormData.avatarUrl) {
      try {
        new URL(editFormData.avatarUrl);
      } catch {
        errors.avatarUrl = 'Please enter a valid URL';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setValidationErrors({});

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const response = await fetch(`http://localhost:8081/api/v1/users/${username}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: editFormData.username,
          email: editFormData.email,
          bio: editFormData.bio,
          avatarUrl: editFormData.avatarUrl
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully');
        setUserData(data);
        localStorage.setItem('username', data.username); // Update username in localStorage
        setTimeout(() => {
          setIsEditModalOpen(false);
        }, 1500);
      } else {
        // Handle validation errors from the backend
        if (data.username) {
          setValidationErrors(prev => ({ ...prev, username: data.username }));
        }
        if (data.email) {
          setValidationErrors(prev => ({ ...prev, email: data.email }));
        }
        if (data.message) {
          setError(data.message);
        }
      }
    } catch (err) {
      setError('An error occurred while updating profile');
      console.error('Profile update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setSuccess('');
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const response = await fetch(`http://localhost:8081/api/v1/users/${username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Profile deleted successfully');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to delete profile');
        setIsDeleting(false);
      }
    } catch (err) {
      setError('An error occurred while deleting profile');
      console.error('Profile delete error:', err);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Main Content */}
        <div className="pt-5 px-4 max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-2xl shadow-lg p-8 mb-8 transform transition-all hover:shadow-xl">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative group">
                {userData.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt="Profile"
                    className="w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-lg transform transition-all group-hover:scale-105"
                  />
                ) : (
                  <img
                    src="https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg"
                    alt="Default Profile"
                    className="w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-lg transform transition-all group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 rounded-2xl bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{userData.name || userData.username}</h1>
                <p className="text-blue-600 text-lg mb-6">@{userData.username}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-8 mb-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="text-center">
                      <span className="block text-4xl font-bold text-blue-600 mb-1">{userData.stats?.creations || 0}</span>
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Creations</span>
                    </div>
                  </div>
                  <div className="w-px h-12 bg-gray-200 hidden md:block self-center"></div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="text-center">
                      <span className="block text-4xl font-bold text-blue-600 mb-1">{userData.stats?.followers || 0}</span>
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Followers</span>
                    </div>
                  </div>
                  <div className="w-px h-12 bg-gray-200 hidden md:block self-center"></div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="text-center">
                      <span className="block text-4xl font-bold text-blue-600 mb-1">{userData.stats?.following || 0}</span>
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Following</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-lg max-w-2xl leading-relaxed">
                  {userData.bio || "Passionate origami artist sharing my paper folding journey. Always learning, always creating! 🎨"}
                </p>
              </div>
              <div className="flex flex-col space-y-4 min-w-[160px]">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105 hover:shadow-md flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all transform hover:scale-105 hover:shadow-md flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Profile
                </button>
              </div>
            </div>
          </div>

          {/* Achievement Badges Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8 transform transition-all hover:shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievement Badges</h2>
            {userData?.badges && userData.badges.length > 0 ? (
              <AchievementBadges badges={userData.badges} />
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Badges Yet</h3>
                <p className="text-gray-600 text-lg mb-4">Start interacting with the community to earn your first badge!</p>
                <p className="text-blue-500 font-medium">Create tutorials and engage with others to unlock achievements.</p>
              </div>
            )}
          </motion.div>

          {/* Content Tabs */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl">
            <div className="border-b border-gray-100">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('creations')}
                  className={`flex-1 py-5 px-6 text-center text-lg font-medium transition-all ${
                    activeTab === 'creations'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  My Creations
                </button>
                <button
                  onClick={() => setActiveTab('tutorials')}
                  className={`flex-1 py-5 px-6 text-center text-lg font-medium transition-all ${
                    activeTab === 'tutorials'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tutorials
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex-1 py-5 px-6 text-center text-lg font-medium transition-all ${
                    activeTab === 'saved'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Saved
                </button>
              </div>
            </div>
            
            <div className="p-8">
             {activeTab === 'creations' && <MyCreations />}
              
              {activeTab === 'tutorials' && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 font-medium text-lg">No tutorials created yet</p>
                  <p className="text-gray-400 mt-2">Share your knowledge with the community</p>
                </div>
              )}
              
              {activeTab === 'saved' && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <p className="text-gray-500 font-medium text-lg">No saved items yet</p>
                  <p className="text-gray-400 mt-2">Save tutorials and creations for later</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={editFormData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50"
                placeholder="Choose a username"
                required
                disabled={true}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={editFormData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50"
                placeholder="Enter your email"
                required
                disabled={true}
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={editFormData.bio}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  validationErrors.bio ? 'border-red-500' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-400 resize-none`}
                disabled={isLoading}
                placeholder="Tell us about yourself..."
              />
              {validationErrors.bio && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.bio}</p>
              )}
            </div>

            <div>
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture URL
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="url"
                  id="avatarUrl"
                  name="avatarUrl"
                  value={editFormData.avatarUrl}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-2.5 rounded-lg border ${
                    validationErrors.avatarUrl ? 'border-red-500' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-400`}
                  placeholder="https://example.com/profile-picture.jpg"
                  disabled={isLoading}
                />
                {editFormData.avatarUrl && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                      src={editFormData.avatarUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              {validationErrors.avatarUrl && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.avatarUrl}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex space-x-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Profile Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setDeleteConfirmation('');
          }
        }}
        title="Delete Profile"
      >
        <div className="space-y-6">
          {isDeleting ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Deleting your profile...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          ) : (
            <>
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium">Warning: This action cannot be undone!</p>
                <p className="mt-1">To confirm deletion, please type "confirm" in the box below:</p>
              </div>

              <div>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                  placeholder="Type 'confirm' to delete your profile"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmation('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProfile}
                  disabled={deleteConfirmation !== 'confirm'}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Profile
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Profile; 