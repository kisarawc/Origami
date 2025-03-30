import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../../assets/logo.png';

function CreateBadge() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    criteria: {
      type: '',
      count: 0
    }
  });

  const criteriaTypes = [
    { id: 'followers', label: 'Follow Count' },
    { id: 'created_tutorials', label: 'Created Tutorials Count' },
    { id: 'completed_tutorials', label: 'Completed Tutorials Count' }

  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8081/api/v1/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowSuccessModal(true);
        // Navigate after 2 seconds
        setTimeout(() => {
          navigate('/admin/current-badges');
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create badge');
      }
    } catch (error) {
      console.error('Error creating badge:', error);
      alert('Failed to create badge');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'criteriaType' || name === 'criteriaCount') {
      setFormData(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          [name === 'criteriaType' ? 'type' : 'count']: name === 'criteriaCount' ? parseInt(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src={logoImage} alt="Origami" />
                <span className="ml-2 text-xl font-bold text-gray-900">Origami Admin</span>
              </div>
              <nav className="flex items-center space-x-6">
                <button 
                  className="text-lg font-semibold text-blue-600 border-b-2 border-blue-600 pb-1"
                  onClick={() => navigate('/admin/create-badge')}
                >
                  Create Badge
                </button>
                <button 
                  className="text-lg font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                  onClick={() => navigate('/admin/current-badges')}
                >
                  Current Badges
                </button>
              </nav>
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

      {/* Main Content with padding for fixed header */}
      <div className="pt-24 pb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Badge</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Enter badge name"
                  required
                />
              </div>

              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Icon (emoji)
                </label>
                <input
                  type="text"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Enter emoji icon (e.g., 🏆)"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Enter badge description"
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Award Criteria
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="criteriaType" className="block text-sm text-gray-600 mb-1">
                      Criteria Type
                    </label>
                    <select
                      id="criteriaType"
                      name="criteriaType"
                      value={formData.criteria.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      required
                    >
                      <option value="">Select criteria type</option>
                      {criteriaTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="criteriaCount" className="block text-sm text-gray-600 mb-1">
                      Required Count
                    </label>
                    <input
                      type="number"
                      id="criteriaCount"
                      name="criteriaCount"
                      value={formData.criteria.count}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Enter required count"
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Users will receive this badge when they reach the specified count for the selected criteria.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Badge
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Badge Created Successfully!
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Your new badge has been created and will be available in the badges list.
                </p>
                <div className="animate-pulse text-sm text-gray-500">
                  Redirecting to badges list...
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CreateBadge; 