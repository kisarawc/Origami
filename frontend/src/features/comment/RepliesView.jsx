import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EditComment from './EditComment';

const RepliesView = ({ parentCommentId, postId, triggerRefresh, postAuthorId }) => {
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editText, setEditText] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [likedReplies, setLikedReplies] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchReplies();
    // eslint-disable-next-line
  }, [parentCommentId]);

  useEffect(() => {
    // Get current user ID from localStorage
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      axios.get(`http://localhost:8081/api/v1/users/${username}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => setCurrentUserId(res.data.id)).catch(() => setCurrentUserId(null));
    }
  }, []);

  const fetchReplies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view replies');
        setIsLoading(false);
        return;
      }
      const response = await axios.get(`http://localhost:8081/comments/replies/${parentCommentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // For each reply, fetch the user info using the new endpoint
      const repliesWithUserInfo = await Promise.all(response.data.map(async (reply) => {
        try {
          const userInfoRes = await axios.get(`http://localhost:8081/comments/user-info/${reply.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          return { 
            ...reply, 
            username: userInfoRes.data.username,
            userId: userInfoRes.data.userId // Add userId from the response
          };
        } catch (e) {
          console.error('Error fetching user info for reply', reply.id, e);
          return { ...reply, username: 'Unknown User', userId: null };
        }
      }));

      setReplies(repliesWithUserInfo);
    } catch (err) {
      setError('Failed to fetch replies.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReply = (replyId, currentText) => {
    setEditingReplyId(replyId);
    setEditText(currentText);
    setOpenMenuId(null); // Close the menu after selecting edit
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      setOpenMenuId(null); // Close the menu if user cancels
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to delete replies');
        return;
      }

      await axios.delete(`http://localhost:8081/comments/delete/${replyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setOpenMenuId(null); // Close the menu after successful deletion
      fetchReplies();
    } catch (err) {
      console.error('Error deleting reply:', err);
      setError('Failed to delete reply. Please try again.');
    }
  };

  const handleSaveEdit = async (replyId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to edit replies');
        return;
      }

      await axios.put(`http://localhost:8081/comments/update`, {
        id: replyId,
        text: editText
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setEditingReplyId(null);
      setEditText('');
      fetchReplies();
    } catch (err) {
      console.error('Error updating reply:', err);
      setError('Failed to update reply. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingReplyId(null);
    setEditText('');
  };

  const toggleMenu = (replyId) => {
    setOpenMenuId(openMenuId === replyId ? null : replyId);
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

  const handleLikeReply = async (replyId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to like replies');
        return;
      }

      const isLiked = likedReplies.has(replyId);
      const endpoint = isLiked ? 'unlike' : 'like';
      
      await axios.post(`http://localhost:8081/comments/${replyId}/${endpoint}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update liked replies state
      setLikedReplies(prev => {
        const newLiked = new Set(prev);
        if (isLiked) {
          newLiked.delete(replyId);
        } else {
          newLiked.add(replyId);
        }
        return newLiked;
      });

      // Refresh replies to get updated like count
      fetchReplies();
    } catch (err) {
      console.error('Error liking reply:', err);
      setError('Failed to like reply. Please try again.');
    }
  };

  if (isLoading) return <div className="ml-8 text-gray-400 text-sm">Loading replies...</div>;
  if (error) return <div className="ml-8 text-red-500 text-sm">{error}</div>;
  if (replies.length === 0) return null;

  return (
    <div className="ml-8 mt-2 space-y-2">
      {replies.map(reply => {
        const isCurrentUserReply = currentUserId && currentUserId === reply.userId;
        const isLiked = likedReplies.has(reply.id);
        
        return (
          <div key={reply.id} className="bg-gray-50 rounded p-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                  {reply.userAvatar ? (
                    <img 
                      src={reply.userAvatar} 
                      alt={reply.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">👤</span>
                  )}
                </div>
                <div>
                  <p 
                    className="font-semibold text-gray-800 text-sm cursor-pointer hover:text-blue-500"
                    onClick={() => handleUsernameClick(reply.username)}
                  >
                    {reply.username}
                    {isCurrentUserReply && (
                      <span className="ml-2 text-xs text-blue-500">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(reply.createdDate).toLocaleString()}
                  </p>
                </div>
              </div>
              {isCurrentUserReply && !editingReplyId && (
                <div className="comment-menu relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(reply.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <span className="text-gray-500 text-xl">⋮</span>
                  </button>
                  {openMenuId === reply.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50 py-1">
                      <button
                        onClick={() => handleEditReply(reply.id, reply.text)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit reply
                      </button>
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete reply
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {editingReplyId === reply.id ? (
              <div className="mt-2 flex justify-end">
                <div className="w-full max-w-2xl">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={2}
                  />
                  <div className="mt-1 flex justify-end space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(reply.id)}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="mt-1 text-gray-700 text-sm">{reply.text}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <button
                    onClick={() => handleLikeReply(reply.id)}
                    className={`flex items-center space-x-1 text-xs ${
                      isLiked ? 'text-blue-500' : 'text-gray-500'
                    } hover:text-blue-500`}
                  >
                    <svg
                      className="w-3 h-3"
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
                    <span>{reply.likeCount || 0}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RepliesView; 