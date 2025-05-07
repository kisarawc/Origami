import React, { useState, useRef } from 'react';
import { EllipsisHorizontalIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Modal from '../../shared/components/Modal';
import PostForm from './PostForm';

const PostCard = ({ post, onPostUpdate, onPostDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const currentUsername = localStorage.getItem('username');
  const isOwner = post.userName === currentUsername;

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

  const getMediaArray = () => {
    if (post.imageUrls && post.imageUrls.length > 0) return post.imageUrls;
    if (post.videoUrl) return [post.videoUrl];
    return [];
  };

  const mediaArray = getMediaArray();
  const isVideo = (url) => url === post.videoUrl;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-[500px] mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
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
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    setShowEditModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Post
                </button>
                <button
                  onClick={() => {
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

      {/* Edit Modal */}
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

      {/* Delete Modal */}
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

      {/* Media Viewer */}
      {mediaArray.length > 0 && (
        <div className="w-full h-[400px] relative overflow-hidden">
          {isVideo(mediaArray[currentImageIndex]) ? (
            <video
              src={mediaArray[currentImageIndex]}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={mediaArray[currentImageIndex]}
              alt="Post"
              className="w-full h-full object-cover"
            />
          )}
          {mediaArray.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/70 z-10"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/70 z-10"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-4 pt-3 pb-4">
        <h2 className="text-base font-semibold text-gray-900">{post.title}</h2>
        {post.description && (
          <p className="text-sm text-gray-700 mt-1">{post.description}</p>
        )}
      </div>
    </div>
  );
};

export default PostCard;
