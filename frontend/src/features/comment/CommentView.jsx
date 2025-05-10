import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EditComment from './EditComment';
import ReplyInput from './ReplyInput';
import RepliesView from './RepliesView';

const CommentView = ({ postId, triggerRefresh, postAuthorId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null); // Track which comment's menu is open
  const [editSuccess, setEditSuccess] = useState(false); // New state for edit success
  const [replyingToId, setReplyingToId] = useState(null); // Track which comment is being replied to
  const [likedComments, setLikedComments] = useState(new Set());
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();

  // Predefined quick reactions
  const quickReactions = [
    "Great work! 👏",
    "Amazing! ✨",
    "Love this! ❤️",
    "Well done! 👍",
    "Beautiful! 🌟",
    "Impressive! 😮",
    "Keep it up! 💪",
    "Nice one! 👌"
  ];

  // Function to handle quick reaction selection and posting
  const handleQuickReaction = async (reaction) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to post comments');
        return;
      }

      if (!currentUser) {
        setError('User information not found. Please try again.');
        return;
      }

      const commentData = {
        postId: postId,
        text: reaction,
        createdDate: new Date().toISOString(),
        createdBy: currentUser.id,
        username: currentUser.username,
        userAvatar: currentUser.avatarUrl
      };

      await axios.post('http://localhost:8081/comments/create', commentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setError(null);
      fetchComments(); // Refresh comments after posting
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to post comment. Please try again.');
    }
  };

  // Function to handle comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to post comments');
        return;
      }

      const commentData = {
        postId: postId,
        text: newComment,
        createdDate: new Date().toISOString()
      };

      await axios.post('http://localhost:8081/comments/create', commentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNewComment('');
      setError(null);
      fetchComments(); // Refresh comments after posting
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to post comment. Please try again.');
    }
  };

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
      
      // For each comment, fetch the user info using the new endpoint
      const commentsWithUserInfo = await Promise.all(response.data.map(async (comment) => {
        try {
          const userInfoRes = await axios.get(`http://localhost:8081/comments/user-info/${comment.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          return { 
            ...comment, 
            username: userInfoRes.data.username,
            userId: userInfoRes.data.userId
          };
        } catch (e) {
          console.error('Error fetching user info for comment', comment.id, e);
          return { ...comment, username: 'Unknown User', userId: null };
        }
      }));

      // Sort comments by createdDate in descending order (newest first)
      const sortedComments = commentsWithUserInfo.sort((a, b) => 
        new Date(b.createdDate) - new Date(a.createdDate)
      );
      
      setComments(sortedComments);
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

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
  };

  const handleSaveEdit = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to edit comments');
        return;
      }

      await axios.put(`http://localhost:8081/comments/update`, {
        id: commentId,
        text: editText
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setEditingCommentId(null);
      setEditText('');
      fetchComments();
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
      
      fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
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

  const handleUsernameClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleLikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to like comments');
        return;
      }

      const isLiked = likedComments.has(commentId);
      const endpoint = isLiked ? 'unlike' : 'like';
      
      await axios.post(`http://localhost:8081/comments/${commentId}/${endpoint}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update liked comments state
      setLikedComments(prev => {
        const newLiked = new Set(prev);
        if (isLiked) {
          newLiked.delete(commentId);
        } else {
          newLiked.add(commentId);
        }
        return newLiked;
      });

      // Refresh comments to get updated like count
      fetchComments();
    } catch (err) {
      console.error('Error liking comment:', err);
      setError('Failed to like comment. Please try again.');
    }
  };

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
      {/* Quick Reactions Section - Only show if user is logged in */}
      {currentUser && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600 mb-2">Quick reactions:</p>
            <div className="flex flex-wrap gap-2">
              {quickReactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReaction(reaction)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex items-center space-x-1"
                >
                  <span>{reaction}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-center">{error}</div>
      )}

      {/* Existing Comments Section */}
      {editSuccess && (
        <div className="text-green-600 text-center font-semibold">Comment updated successfully!</div>
      )}
      {comments.filter(comment => !comment.parentCommentId).length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        comments.filter(comment => !comment.parentCommentId).map(comment => {
          console.log('Current user ID:', currentUser?.id);
          console.log('Comment created by userId:', comment.createdByUserId);
          console.log('Is current user comment:', currentUser && currentUser.id === comment.createdByUserId);
          
          const isCurrentUserComment = currentUser && currentUser.id === comment.userId;
          const isAuthorComment = postAuthorId && comment.createdByUserId === postAuthorId;
          const isLiked = likedComments.has(comment.id);
          
          return (
            <div key={comment.id} className={`bg-white rounded-lg shadow-sm p-4 relative ${isAuthorComment ? 'border-2 border-yellow-400' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3 flex-1">
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
                    <p 
                      className="font-semibold text-gray-900 cursor-pointer hover:text-blue-500"
                      onClick={() => handleUsernameClick(comment.username)}
                    >
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
                {isCurrentUserComment && !editingCommentId && (
                  <div className="comment-menu relative ml-4">
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
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50 py-1">
                        <button
                          onClick={() => handleEditComment(comment.id, comment.text)}
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
                <div className="mt-3 flex justify-end">
                  <div className="w-full max-w-2xl">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mt-3 text-gray-700">{comment.text}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center space-x-1 text-sm ${
                        isLiked ? 'text-blue-500' : 'text-gray-500'
                      } hover:text-blue-500`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      <span>{comment.likeCount || 0}</span>
                    </button>
                  </div>
                </div>
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