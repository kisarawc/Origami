import React, { useState, useRef } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import Modal from '../../shared/components/Modal';
import PostForm from './PostForm';
import CommentSection from '../../features/comment/comment';
import { useNavigate } from 'react-router-dom';

const PostCard = ({
  post,
  onPostUpdate,
  onPostDelete,
  isDetailView = false,
  deleting = false,
  enableNavigation = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const currentUsername = localStorage.getItem('username');
  const isOwner = post.userName === currentUsername;

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
      // Handle error optionally
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8081/api/v1/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onPostDelete) onPostDelete(post.id);
    } catch (err) {
      setError('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">👤</div>
          <div>
            <p className="font-semibold">{post.userName}</p>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu((prev) => !prev)}>
              <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setShowEditModal(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>

      {post.description && (
        <p className="mb-4 text-gray-700">{post.description}</p>
      )}

      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className="relative mb-4">
          <img
            src={post.imageUrls[currentImageIndex]}
            alt={`Post image ${currentImageIndex + 1}`}
            className="w-full h-64 object-cover rounded-lg"
          />
          {post.imageUrls.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? post.imageUrls.length - 1 : prev - 1
                  )
                }
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === post.imageUrls.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}

      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center space-x-1 ${post.likedByCurrentUser ? 'text-red-500' : 'text-gray-500'}`}
        >
          {post.likedByCurrentUser ? (
            <HeartIconSolid className="w-5 h-5" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
          <span>{post.likeCount}</span>
        </button>
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center space-x-1 text-gray-500"
        >
          💬 <span>Comments</span>
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} />}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Post"
      >
        <PostForm
          post={post}
          onSubmit={(updatedPost) => {
            onPostUpdate(updatedPost);
            setShowEditModal(false);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <div className="p-4">
          <p>Are you sure you want to delete this post?</p>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PostCard;
