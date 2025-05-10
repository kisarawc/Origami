import React, { useState, useEffect, useRef } from 'react';
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [validationFailed, setValidationFailed] = useState(false);
  const fileInputRef = useRef(null);

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

      console.log(`Checking completion status for tutorial ID: ${id}`);

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
      console.log(`Completion status for tutorial ID ${id}: ${status}`);
      setIsCompleted(status);
    } catch (err) {
      console.error('Error checking completion status:', err);
      setError(err.message);
    }
  };

  const handleComplete = () => {
    setShowImageModal(true);
    setImageError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      setImageError(null);
    };
    reader.readAsDataURL(file);
  };

  // Camera capture functionality has been removed

  const handleSubmitImage = async () => {
    if (!capturedImage) {
      setImageError('Please upload an image first');
      return;
    }

    try {
      setComparing(true);
      setValidationFailed(false); // Reset validation state
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log(`Sending image comparison request for tutorial ID: ${id}`);

      // Create the request payload
      const requestData = {
        userImage: capturedImage
      };

      // Log the request (without the full image data for brevity)
      console.log('Request headers:', {
        'Authorization': 'Bearer [TOKEN]',
        'Content-Type': 'application/json'
      });
      console.log('Request payload structure:', {
        userImage: capturedImage ? '[BASE64_IMAGE_DATA]' : null
      });

      // Send the request to the server for image comparison
      const response = await fetch(`http://localhost:8081/api/v1/completed-tutorials/${id}/compare`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', {
        'Content-Type': response.headers.get('content-type')
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage;

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || JSON.stringify(errorData);
            console.error('Error response (JSON):', errorData);
          } catch (jsonError) {
            console.error('Failed to parse JSON error:', jsonError);
            errorMessage = await response.text();
            console.error('Error response (text):', errorMessage);
          }
        } else {
          errorMessage = await response.text();
          console.error('Error response (text):', errorMessage);
        }

        throw new Error(errorMessage || `Failed to verify completion: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Comparison result:', result);

      // Calculate similarity percentage for display
      const similarityPercentage = Math.round(result.similarityScore * 100);
      const similarityThreshold = 65; // This should match the backend threshold

      console.log(`Similarity check: score=${similarityPercentage}%, threshold=${similarityThreshold}%, isMatch=${result.isMatch}`);

      // Check if the similarity score meets our threshold - use either backend's isMatch or our threshold
      if (result.isMatch || similarityPercentage >= similarityThreshold) {
        // If it's a match according to the backend, mark as completed
        setIsCompleted(true);
        setShowImageModal(false);
        setCapturedImage(null);
        setValidationFailed(false);

        // The backend already saves the completion in the compareImages method if it's a match
        // So we don't need to explicitly call the markTutorialAsCompleted endpoint
        console.log('Tutorial marked as completed based on successful image comparison');

        // Refresh the completion status after a short delay to ensure the backend has processed everything
        setTimeout(() => {
          checkCompletionStatus();
        }, 1000);
      } else {
        // Set validation failed to true to disable the submit button
        setValidationFailed(true);

        // Show a more helpful error message based on how close they were
        if (similarityPercentage >= similarityThreshold) {
          // This shouldn't happen now, but just in case
          console.error(`Inconsistency: Score ${similarityPercentage}% >= threshold ${similarityThreshold}% but not marked as match`);
          setImageError(`Your origami meets the similarity threshold (${similarityPercentage}%) but wasn't recognized. Please try again.`);
        } else if (similarityPercentage >= 55) {
          setImageError(`Your origami is close but doesn't quite match the expected shape (similarity: ${similarityPercentage}%). The minimum required is ${similarityThreshold}%. Try adjusting the angle or lighting and take another photo.`);
        } else if (similarityPercentage >= 40) {
          setImageError(`Your origami doesn't match well enough (similarity: ${similarityPercentage}%). The minimum required is ${similarityThreshold}%. Try adjusting the angle, lighting, or make sure you're following the correct tutorial.`);
        } else {
          setImageError(`Your image doesn't appear to be the correct origami (similarity: ${similarityPercentage}%). The minimum required is ${similarityThreshold}%. Please complete the tutorial and try again with the correct origami.`);
        }
      }
    } catch (err) {
      setImageError(err.message);
      setValidationFailed(true);
      console.error('Error verifying completion:', err);
    } finally {
      setComparing(false);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setCapturedImage(null);
    setImageError(null);
    setValidationFailed(false);
  };

  // Function to reset the image and try again
  const resetImage = () => {
    setCapturedImage(null);
    setImageError(null);
    setValidationFailed(false);
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
      {/* Image Capture Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Complete Tutorial</h3>
            <p className="mb-4">Upload a photo of your completed origami to verify it matches the tutorial.</p>

            {imageError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {imageError}
              </div>
            )}

            <div className="mb-4">
              {capturedImage ? (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured origami"
                    className="w-full h-64 object-contain border rounded-lg"
                  />
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">No image uploaded yet</p>
                  <div className="flex justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={closeImageModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={validationFailed ? resetImage : handleSubmitImage}
                disabled={(!capturedImage && !validationFailed) || comparing}
                className={`px-4 py-2 ${validationFailed ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
              >
                {comparing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : validationFailed ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Try Again with New Image
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Verify Completion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
