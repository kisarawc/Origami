import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditComment from './EditComment';
import ReplyInput from './ReplyInput';
import RepliesView from './RepliesView';

const CommentView = ({ postId, triggerRefresh, postAuthorId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null); // Track which comment's menu is open
  const [editSuccess, setEditSuccess] = useState(false); // New state for edit success
  const [replyingToId, setReplyingToId] = useState(null); // Track which comment is being replied to

  useEffect(() => {
    fetchCurrentUser();
    fetchComments();
  }, [postId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      if (!token || !username) {
        setError('Please login to view comments');
        return;
      }

      const response = await axios.get(`http://localhost:8081/api/v1/users/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        console.log('Current user data:', response.data);
        setCurrentUser({
          id: response.data.id,
          username: response.data.username,
          name: response.data.name,
          avatarUrl: response.data.avatarUrl
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view comments');
        return;
      }

      const response = await axios.get(`http://localhost:8081/comments/post/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // For each comment, fetch the user ID using the new endpoint
      const commentsWithUserId = await Promise.all(response.data.map(async (comment) => {
        try {
          const userIdRes = await axios.get(`http://localhost:8081/comments/user-id/${comment.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          return { ...comment, createdByUserId: userIdRes.data.userId };
        } catch (e) {
          console.error('Error fetching user ID for comment', comment.id, e);
          return { ...comment, createdByUserId: null };
        }
      }));
      
      setComments(commentsWithUserId);
    } catch (err) {
      console.error('Error fetching comments:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 404) {
        setError('No comments found for this post.');
      } else {
        setError('Failed to fetch comments. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = (commentId) => {
    setEditingCommentId(commentId);
    setOpenMenuId(null); // Close the menu after selecting edit
  };

  const handleSaveComment = async (commentId, newText) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to edit comments');
        return;
      }

      await axios.put(`http://localhost:8081/comments/update`, {
        id: commentId,
        text: newText
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setEditingCommentId(null);
      if (triggerRefresh) triggerRefresh();
      setEditSuccess(true); // Show success message
      setTimeout(() => setEditSuccess(false), 2000); // Hide after 2 seconds
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to delete comments');
        return;
      }

      await axios.delete(`http://localhost:8081/comments/delete/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setOpenMenuId(null); // Close the menu after deleting
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
  };

  const toggleMenu = (commentId) => {
    setOpenMenuId(openMenuId === commentId ? null : commentId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.comment-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchComments}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {editSuccess && (
        <div className="text-green-600 text-center font-semibold">Comment updated successfully!</div>
      )}
      {comments.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        comments.map(comment => {
          console.log('Current user ID:', currentUser?.id);
          console.log('Comment created by userId:', comment.createdByUserId);
          console.log('Is current user comment:', currentUser && currentUser.id === comment.createdByUserId);
          
          const isCurrentUserComment = currentUser && currentUser.id === comment.createdByUserId;
          const isAuthorComment = postAuthorId && comment.createdByUserId === postAuthorId;
          
          return (
            <div key={comment.id} className={`bg-white rounded-lg shadow-sm p-4 relative ${isAuthorComment ? 'border-2 border-yellow-400' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {comment.userAvatar ? (
                      <img 
                        src={comment.userAvatar} 
                        alt={comment.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">👤</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {comment.username}
                      {isCurrentUserComment && (
                        <span className="ml-2 text-xs text-blue-500">(You)</span>
                      )}
                      {isAuthorComment && (
                        <span className="ml-2 text-xs bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded">Author</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                {isCurrentUserComment && (
                  <div className="comment-menu relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(comment.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <span className="text-gray-500 text-xl">⋮</span>
                    </button>
                    {openMenuId === comment.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit comment
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete comment
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {editingCommentId === comment.id ? (
                <EditComment
                  comment={comment}
                  onSave={handleSaveComment}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <p className="mt-3 text-gray-700">{comment.text}</p>
              )}
              {/* Reply button and input */}
              <div className="mt-2 flex items-center space-x-2">
                <button
                  className="text-blue-500 text-sm hover:underline"
                  onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                >
                  Reply
                </button>
              </div>
              {replyingToId === comment.id && (
                <ReplyInput
                  parentCommentId={comment.id}
                  postId={postId}
                  onSuccess={() => {
                    setReplyingToId(null);
                    if (triggerRefresh) triggerRefresh();
                  }}
                  onCancel={() => setReplyingToId(null)}
                />
              )}
              {/* Replies */}
              <RepliesView parentCommentId={comment.id} postId={postId} triggerRefresh={triggerRefresh} postAuthorId={postAuthorId} />
            </div>
          );
        })
      )}
    </div>
  );
};

export default CommentView; 