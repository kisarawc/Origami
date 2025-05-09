import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

const MyTutorials = () => {
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchMyTutorials();
  }, []);

  const fetchMyTutorials = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8081/api/v1/tutorials/my-tutorials', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch tutorials');
      }

      const data = await response.json();
      setTutorials(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tutorialId) => {
    if (!window.confirm('Are you sure you want to delete this tutorial?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/v1/tutorials/${tutorialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete tutorial');
      }

      setTutorials(tutorials.filter(tutorial => tutorial.id !== tutorialId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (tutorialId) => {
    navigate(`/tutorials/edit/${tutorialId}`);
  };

  const handleTutorialClick = (tutorial) => {
    setSelectedTutorial(tutorial);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedTutorial(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchMyTutorials}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (tutorials.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tutorials Found</h3>
        <p className="text-gray-600 mb-4">You haven't created any tutorials yet.</p>
        <button
          onClick={() => navigate('/tutorials/create')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Create Your First Tutorial
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Tutorials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <div
            key={tutorial.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer"
            onClick={() => handleTutorialClick(tutorial)}
          >
            <div className="relative">
              <img
                src={tutorial.finalImage}
                alt={tutorial.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(tutorial.id);
                    }}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(tutorial.id);
                    }}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{tutorial.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tutorial.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {tutorial.stepImages.length} steps
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(tutorial.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-bold text-gray-800">{selectedTutorial.title}</h3>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Main Image and Description */}
              <div className="mb-8">
                <div className="relative rounded-xl overflow-hidden mb-6">
                  <img
                    src={selectedTutorial.finalImage}
                    alt={selectedTutorial.title}
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white text-lg leading-relaxed">{selectedTutorial.description}</p>
                  </div>
                </div>
              </div>

              {/* Category and Difficulty */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <div className="text-sm text-blue-600 font-medium mb-2">Category</div>
                  <div className="text-xl font-semibold text-gray-800">{selectedTutorial.category}</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                  <div className="text-sm text-purple-600 font-medium mb-2">Difficulty</div>
                  <div className="text-xl font-semibold text-gray-800">{selectedTutorial.difficulty}</div>
                </div>
              </div>

              {/* Steps Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-2xl font-bold text-gray-800">Tutorial Steps</h4>
                  <span className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 font-medium">
                    {selectedTutorial.stepImages.length} steps
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedTutorial.stepImages.map((image, index) => (
                    <div key={index} className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                      <img
                        src={image}
                        alt={`Step ${index + 1}`}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                            <div className="text-sm font-medium text-gray-600 mb-1">Step {index + 1}</div>
                            <div className="text-xs text-gray-500">Click to view larger</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={closePreview}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    closePreview();
                    handleEdit(selectedTutorial.id);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Tutorial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTutorials;