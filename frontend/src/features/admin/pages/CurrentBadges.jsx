import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../../assets/logo.png';
import Modal from '../components/Modal';

function CurrentBadges() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [editFormData, setEditFormData] = useState({
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
    { id: 'completed_tutorials', label: 'Completed Tutorials Count' },
    { id: 'likes_received', label: 'Likes Received' },
    { id: 'comments_made', label: 'Comments Made' },
    { id: 'days_active', label: 'Days Active' }
  ];

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/v1/badges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBadges(data);
      } else {
        setError('Failed to fetch badges');
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      setError('Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (badge) => {
    setSelectedBadge(badge);
    setEditFormData({
      name: badge.name,
      icon: badge.icon,
      description: badge.description,
      criteria: badge.criteria
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8081/api/v1/badges/${selectedBadge.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        setShowEditModal(false);
        setShowSuccessModal(true);
        fetchBadges();
        // Close success modal after 2 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update badge');
      }
    } catch (error) {
      console.error('Error updating badge:', error);
      alert('Failed to update badge');
    }
  };

  const handleDelete = async (badgeId) => {
    setSelectedBadge(badgeId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/v1/badges/${selectedBadge}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setShowDeleteModal(false);
        fetchBadges();
       
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete badge');
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('Failed to delete badge');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'criteriaType' || name === 'criteriaCount') {
      setEditFormData(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          [name === 'criteriaType' ? 'type' : 'count']: name === 'criteriaCount' ? parseInt(value) : value
        }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading badges...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

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
                  className="text-lg font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                  onClick={() => navigate('/admin/create-badge')}
                >
                  Create Badge
                </button>
                <button 
                  className="text-lg font-semibold text-blue-600 border-b-2 border-blue-600 pb-1"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Current Badges</h2>
              <button
                onClick={() => navigate('/admin/create-badge')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create New Badge
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{badge.icon}</div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(badge)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(badge.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{badge.name}</h3>
                  <p className="text-gray-600 mb-4">{badge.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>Criteria: {badge.criteria.type}</p>
                    <p>Required Count: {badge.criteria.count}</p>
                  </div>
                </div>
              ))}
            </div>

            {badges.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No badges found. Create your first badge!
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete Badge
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to delete this badge? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Badge</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
                Badge Name
              </label>
              <input
                type="text"
                id="editName"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="editIcon" className="block text-sm font-medium text-gray-700 mb-1">
                Badge Icon (emoji)
              </label>
              <input
                type="text"
                id="editIcon"
                name="icon"
                value={editFormData.icon}
                onChange={handleEditChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="editDescription"
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                rows="3"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Award Criteria
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editCriteriaType" className="block text-sm text-gray-600 mb-1">
                    Criteria Type
                  </label>
                  <select
                    id="editCriteriaType"
                    name="criteriaType"
                    value={editFormData.criteria.type}
                    onChange={handleEditChange}
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
                  <label htmlFor="editCriteriaCount" className="block text-sm text-gray-600 mb-1">
                    Required Count
                  </label>
                  <input
                    type="number"
                    id="editCriteriaCount"
                    name="criteriaCount"
                    value={editFormData.criteria.count}
                    onChange={handleEditChange}
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
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
            Badge Updated Successfully!
          </h3>
          <p className="text-sm text-gray-500">
            The badge has been updated and will be reflected in the list.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default CurrentBadges; 