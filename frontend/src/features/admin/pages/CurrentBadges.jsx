import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../../assets/logo.png';

function CurrentBadges() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // TODO: Replace with actual badge data from API
  const badges = [
    {
      id: 'welcome',
      name: 'Welcome',
      icon: '👋',
      description: 'Joined Origami World',
      criteria: 'Create an account'
    },
    {
      id: 'creator',
      name: 'Creator',
      icon: '🎨',
      description: 'Created your first origami',
      criteria: 'Upload your first origami creation'
    }
  ];

  const handleDelete = async (badgeId) => {
    setIsDeleting(true);
    // TODO: Implement badge deletion logic
    console.log('Deleting badge:', badgeId);
    // Simulate API call
    setTimeout(() => {
      setIsDeleting(false);
      setSelectedBadge(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src={logoImage} alt="Origami" />
                <span className="ml-2 text-xl font-bold text-gray-900">Origami Admin</span>
              </div>
              <div className="flex items-center space-x-6">
                <button 
                  className="text-lg font-semibold text-gray-500 hover:text-blue-600 transition-colors flex items-center"
                  onClick={() => navigate('/admin')}
                >
                  <span className="mr-2">←</span>
                  Back to Badge System
                </button>
                <span className="text-lg font-semibold text-blue-600 border-b-2 border-blue-600 pb-1">
                  Manage Badges
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">@{username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Current Badges</h2>
                <p className="text-gray-600">Manage and monitor existing badges in the system</p>
              </div>
              <button
                onClick={() => navigate('/admin/create-badge')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <span className="mr-2">+</span>
                Create New Badge
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                      {badge.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{badge.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
                  <div className="text-sm mb-4">
                    <span className="font-medium text-gray-700">Criteria:</span>
                    <p className="text-gray-600 mt-1">{badge.criteria}</p>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedBadge(badge)}
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(badge.id)}
                      disabled={isDeleting}
                      className="text-red-500 hover:text-red-600 text-sm font-medium disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {badges.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Badges Yet</h3>
                <p className="text-gray-600 mb-6">Create your first badge to start rewarding users!</p>
                <button
                  onClick={() => navigate('/admin/create-badge')}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Your First Badge
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edit Badge Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-lg w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Badge</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedBadge.name}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  defaultValue={selectedBadge.description}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criteria
                </label>
                <textarea
                  defaultValue={selectedBadge.criteria}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default CurrentBadges; 