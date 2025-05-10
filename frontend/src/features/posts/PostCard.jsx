import React, { useState, useRef } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { EllipsisHorizontalIcon, PencilIcon, TrashIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Modal from '../../shared/components/Modal';
import PostForm from './PostForm';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, onPostUpdate, onPostDelete, isDetailView = false, deleting = false, enableNavigation = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentUsername = localStorage.getItem('username');
  const isOwner = post.userName === currentUsername;
  const fileInputRef = useRef(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const handleLike = async () => {
    setLikeLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8081/api/v1/posts/${post.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onPostUpdate) onPostUpdate(response.data);
    } catch (err) {
      // Optionally show error
    } finally {
      setLikeLoading(false);
    }
  };

  const handleMediaTypeChange = (type) => {
    setEditForm(prev => ({
      ...prev,
      mediaType: type,
      images: [],
      video: null
    }));
  };

  const handleStartEdit = () => {
    setEditForm({
      title: post.title,
      description: post.description,
      mediaType: post.videoUrl ? 'video' : 'images',
      images: post.imageUrls ? [...post.imageUrls] : [],
      video: null
    });
    setShowEditModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = editForm.images || [];
    if (currentImages.length + files.length > 3) {
      setError('You can only upload up to 3 images');
      return;
    }
    setEditForm(prev => ({
      ...prev,
      images: [...currentImages, ...files]
    }));
    setError('');
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
        setEditForm(prev => ({ ...prev, video: null }));
      } else {
        setEditForm(prev => ({ ...prev, video: file }));
        setError('');
      }
    };
    videoElement.src = URL.createObjectURL(file);
  };

  const handleRemoveImage = (idx) => {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);

      if (editForm.mediaType === 'images') {
        const keptUrls = editForm.images.filter(img => typeof img === 'string');
        const newFiles = editForm.images.filter(img => typeof img !== 'string');
        keptUrls.forEach(url => formData.append('keptImageUrls', url));
        newFiles.forEach(file => formData.append('images', file));
      } else if (editForm.mediaType === 'video' && editForm.video) {
        formData.append('video', editForm.video);
      }

      const response = await axios.put(
        `http://localhost:8081/api/v1/posts/${post.id}`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      onPostUpdate(response.data);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update post:', error);
      setError(error.response?.data?.message || 'Failed to update post');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8081/api/v1/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onPostDelete(post.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const removeMedia = () => {
    setEditForm(prev => ({
      ...prev,
      images: [],
      video: null
    }));
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === post.imageUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? post.imageUrls.length - 1 : prevIndex - 1
    );
  };

  // Helper to get all media (images or video)
  const getMediaArray = () => {
    if (post.imageUrls && post.imageUrls.length > 0) return post.imageUrls;
    if (post.videoUrl) return [post.videoUrl];
    return [];
  };
  const mediaArray = getMediaArray();
  const isVideo = (url) => url === post.videoUrl;

  const handlePostClick = () => {
    if (enableNavigation && !isDetailView && !deleting) {
      navigate(`/post/${post.id}`);
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm overflow-hidden ${!isDetailView ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} w-full max-w-[500px] mx-auto`}
      onClick={handlePostClick}
      style={deleting ? { pointerEvents: 'none', opacity: 0.5 } : {}}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={post.avatarUrl || '/default-avatar.png'}
            alt={post.userName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900 text-sm">{post.userName}</p>
            <p className="text-xs text-gray-500">
              {post.updatedAt && post.updatedAt !== post.createdAt
                ? ` ${new Date(post.updatedAt).toLocaleDateString()}`
                : new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Post
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Form */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Post">
        <PostForm
          mode="edit"
          postId={post.id}
          initialTitle={post.title}
          initialDescription={post.description}
          initialImages={post.imageUrls}
          initialVideo={post.videoUrl}
          onSubmit={(updatedPost) => {
            onPostUpdate(updatedPost);
            setShowEditModal(false);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Post">
        <div className="text-center p-4">
          <p className="mb-4 text-gray-700">Are you sure you want to delete this post? This action cannot be undone.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Media Display (Slider) */}
      {!showEditModal && mediaArray.length > 0 && (
        <div className="w-full aspect-square relative overflow-hidden bg-gray-100">
          {isVideo(mediaArray[currentImageIndex]) ? (
            <video
              src={mediaArray[currentImageIndex]}
              controls
              className="w-full h-full object-contain"
              style={{ display: 'block' }}
            />
          ) : (
            <img
              src={mediaArray[currentImageIndex]}
              alt="Post"
              className="w-full h-full object-contain"
              style={{ display: 'block' }}
            />
          )}
          {mediaArray.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/70 transition-colors z-10"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/70 transition-colors z-10"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Title and Description */}
      {!showEditModal && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 line-clamp-2">{post.title}</h2>
          {post.description && (
            <p className="text-sm text-gray-700 mt-1 line-clamp-3">{post.description}</p>
          )}
        </div>
      )}

      {/* Actions */}
      {!showEditModal && (
        <div className="px-4 py-3 flex items-center gap-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            disabled={likeLoading}
            className={`flex items-center gap-1 text-gray-600 hover:text-red-500 transition ${likeLoading ? 'opacity-50' : ''}`}
          >
            {post.likedByCurrentUser ? (
              <HeartIconSolid className="h-6 w-6 text-red-500" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
            <span className="text-sm">{post.likeCount}</span>
          </button>
          <div className="flex items-center gap-1 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm">{post.comments || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;