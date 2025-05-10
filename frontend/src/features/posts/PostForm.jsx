import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const PostForm = ({
  mode = 'create',
  postId = null,
  initialTitle = '',
  initialDescription = '',
  initialImages = [],
  initialVideo = null,
  onSubmit
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [mediaType, setMediaType] = useState(initialVideo ? 'video' : 'images');
  const [images, setImages] = useState(initialImages ? [...initialImages] : []);
  const [video, setVideo] = useState(initialVideo);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setMediaType(initialVideo ? 'video' : 'images');
    setImages(initialImages ? [...initialImages] : []);
    setVideo(initialVideo);
    // eslint-disable-next-line
  }, []); // Only run once on mount

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = images || [];
    if (currentImages.length + files.length > 3) {
      setError('You can only upload up to 3 images');
      return;
    }
    setImages([...currentImages, ...files]);
    setError('');
  };

  const handleRemoveImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoElement.src);
      if (videoElement.duration > 30) {
        setError('Video must be 30 seconds or less');
        setVideo(null);
      } else {
        setVideo(file);
        setError('');
      }
    };
    videoElement.src = URL.createObjectURL(file);
  };

  const handleRemoveVideo = () => {
    setVideo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);

    if (!title.trim()) {
      setError('Title is required');
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);

      if (mediaType === 'images') {
        const keptUrls = images.filter(img => typeof img === 'string');
        const newFiles = images.filter(img => typeof img !== 'string');
        keptUrls.forEach(url => formData.append('keptImageUrls', url));
        newFiles.forEach(file => formData.append('images', file));
      } else if (mediaType === 'video' && video) {
        formData.append('video', video);
      }

      const token = localStorage.getItem('token');
      let response;
      if (mode === 'edit' && postId) {
        response = await axios.put(`http://localhost:8081/api/v1/posts/${postId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await axios.post('http://localhost:8081/api/v1/posts/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (onSubmit) {
        onSubmit(response.data);
      }

      if (mode === 'create') {
        setTitle('');
        setDescription('');
        setImages([]);
        setVideo(null);
        setMediaType('images');
      }
    } catch (error) {
      console.error('POST ERROR:', error);
      setError(error.response?.data?.message || 'Failed to submit post');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{mode === 'edit' ? 'Edit Post' : 'Create a New Post'}</h2>

      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full mb-4 p-2 border rounded"
      />

      <textarea
        placeholder="Post description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows="3"
        className="w-full mb-4 p-2 border rounded"
      />

      <div className="flex space-x-4 mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="images"
            checked={mediaType === 'images'}
            onChange={() => setMediaType('images')}
          />
          <span>Images</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="video"
            checked={mediaType === 'video'}
            onChange={() => setMediaType('video')}
          />
          <span>Video</span>
        </label>
      </div>

      {mediaType === 'images' ? (
        <>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
          {/* Image preview grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {images.map((image, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <input type="file" accept="video/*" onChange={handleVideoChange} />
          {/* Video preview */}
          {video && (
            <div className="relative group mt-2 w-40">
              <video
                src={typeof video === 'string' ? video : URL.createObjectURL(video)}
                className="w-full h-24 object-cover"
                controls
              />
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        type="submit"
        disabled={isUploading}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isUploading ? (mode === 'edit' ? 'Saving...' : 'Uploading...') : (mode === 'edit' ? 'Save Changes' : 'Create Post')}
      </button>
    </form>
  );
};

export default PostForm;
