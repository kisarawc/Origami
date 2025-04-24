import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TutorialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchTutorial();
    checkCompletionStatus();
    // Get current user from localStorage
    const username = localStorage.getItem('username');
    setCurrentUser(username);
  }, [id]);

  const fetchTutorial = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8081/api/v1/tutorials/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Tutorial not found');
        }
        throw new Error('Failed to fetch tutorial');
      }
      const data = await response.json();
      setTutorial(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tutorial:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkCompletionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8081/api/v1/completed-tutorials/${id}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage;
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData;
        } else {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage || 'Failed to check completion status');
      }

      const status = await response.json();
      setIsCompleted(status);
    } catch (err) {
      console.error('Error checking completion status:', err);
      setError(err.message);
    }
  };

  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8081/api/v1/completed-tutorials/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage;
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData;
        } else {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage || 'Failed to mark tutorial as completed');
      }

      setIsCompleted(true);
    } catch (err) {
      setError(err.message);
      console.error('Error completing tutorial:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const nextStep = () => {
    if (tutorial?.stepImages && currentStep < tutorial.stepImages.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/tutorials')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Tutorials
        </button>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Tutorial not found</p>
        <button
          onClick={() => navigate('/tutorials')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Tutorials
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative">
          <img
            src={tutorial.finalImage || 'https://placehold.co/800x400/CCCCCC/666666?text=No+Image'}
            alt={tutorial.title}
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{tutorial.title}</h1>
            <p className="text-white/90 text-lg mb-4">{tutorial.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-white/80">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {tutorial.stepImages?.length || 0} steps
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {tutorial.difficulty}
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {tutorial.category}
                </span>
              </div>
              {isCompleted ? (
                <div className="flex items-center space-x-2 bg-green-600/90 text-white px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Completed</span>
                </div>
              ) : currentUser && currentUser !== tutorial.authorUsername && (
                <button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Completing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Complete Tutorial</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Folding Steps</h2>
          
          {/* Slideshow */}
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-xl overflow-hidden">
              {tutorial.stepImages && tutorial.stepImages.length > 0 ? (
                <img
                  src={tutorial.stepImages[currentStep]}
                  alt={`Step ${currentStep + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No step images available</p>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all ${
                  currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextStep}
                disabled={currentStep === tutorial.stepImages.length - 1}
                className={`p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all ${
                  currentStep === tutorial.stepImages.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Step Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              Step {currentStep + 1} of {tutorial.stepImages.length}
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {tutorial.stepImages && tutorial.stepImages.length > 0 && (
            <div className="mt-6">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {tutorial.stepImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentStep === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Step ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialDetail; 