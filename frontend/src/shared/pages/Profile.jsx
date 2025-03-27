import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import { motion } from 'framer-motion';

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('creations');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    bio: '',
    profilePicture: ''
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
          profilePicture: data.avatarUrl || ''
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
    if (editFormData.profilePicture) {
      try {
        new URL(editFormData.profilePicture);
      } catch {
        errors.profilePicture = 'Please enter a valid URL';
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
          avatarUrl: editFormData.profilePicture
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
        <div className="pt-20 px-4 max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                {userData.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                    {userData.name?.charAt(0) || userData.username?.charAt(0)}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600">
                  📷
                </button>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{userData.name || userData.username}</h1>
                <p className="text-gray-500 mb-4">@{userData.username}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{userData.stats?.creations || 0}</div>
                    <div className="text-sm text-gray-500">Creations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{userData.stats?.followers || 0}</div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{userData.stats?.following || 0}</div>
                    <div className="text-sm text-gray-500">Following</div>
                  </div>
                </div>
                <p className="text-gray-700 max-w-2xl">
                  {userData.bio || "Passionate origami artist sharing my paper folding journey. Always learning, always creating! 🎨"}
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800">
                  ⚙️
                </button>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Achievement Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {userData.badges?.map((badge, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    {badge.icon || '🏆'}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Tabs */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('creations')}
                  className={`flex-1 py-4 px-6 text-center ${
                    activeTab === 'creations'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  My Creations
                </button>
                <button
                  onClick={() => setActiveTab('tutorials')}
                  className={`flex-1 py-4 px-6 text-center ${
                    activeTab === 'tutorials'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Tutorials
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex-1 py-4 px-6 text-center ${
                    activeTab === 'saved'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Saved
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'creations' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Add your creations content here */}
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    No creations yet
                  </div>
                </div>
              )}
              
              {activeTab === 'tutorials' && (
                <div className="text-center text-gray-500">
                  No tutorials created yet
                </div>
              )}
              
              {activeTab === 'saved' && (
                <div className="text-center text-gray-500">
                  No saved items yet
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
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  validationErrors.username ? 'border-red-500' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-400`}
                required
                disabled={isLoading}
                placeholder="Enter your username"
              />
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
              )}
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
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-400`}
                required
                disabled={isLoading}
                placeholder="Enter your email"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
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
              <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture URL
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="url"
                  id="profilePicture"
                  name="profilePicture"
                  value={editFormData.profilePicture}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-2.5 rounded-lg border ${
                    validationErrors.profilePicture ? 'border-red-500' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-400`}
                  placeholder="https://example.com/profile-picture.jpg"
                  disabled={isLoading}
                />
                {editFormData.profilePicture && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                      src={editFormData.profilePicture}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              {validationErrors.profilePicture && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.profilePicture}</p>
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
    </div>
  );
}

export default Profile; 