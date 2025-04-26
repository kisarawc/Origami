import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditComment from './EditComment';

const RepliesView = ({ parentCommentId, postId, triggerRefresh, postAuthorId }) => {
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

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
      setReplies(response.data);
    } catch (err) {
      setError('Failed to fetch replies.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReply = (replyId) => {
    setEditingReplyId(replyId);
    setOpenMenuId(null);
  };

  const handleSaveReply = async (replyId, newText) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.put(`http://localhost:8081/comments/update`, {
        id: replyId,
        text: newText
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setEditingReplyId(null);
      fetchReplies();
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.delete(`http://localhost:8081/comments/delete/${replyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOpenMenuId(null);
      fetchReplies();
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      // Optionally handle error
    }
  };

  const toggleMenu = (replyId) => {
    setOpenMenuId(openMenuId === replyId ? null : replyId);
  };

  if (isLoading) return <div className="ml-8 text-gray-400 text-sm">Loading replies...</div>;
  if (error) return <div className="ml-8 text-red-500 text-sm">{error}</div>;
  if (replies.length === 0) return null;

  return (
    <div className="ml-8 mt-2 space-y-2">
      {replies.map(reply => {
        const isCurrentUserReply = currentUserId && reply.createdBy === currentUserId;
        return (
          <div key={reply.id} className={`bg-gray-50 rounded p-3 flex items-start space-x-3 ${postAuthorId && reply.createdBy === postAuthorId ? 'border-2 border-yellow-400' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
              {reply.userAvatar ? (
                <img src={reply.userAvatar} alt={reply.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-gray-500">👤</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-800 text-sm">{reply.username}
                  {postAuthorId && reply.createdBy === postAuthorId && (
                    <span className="ml-2 text-xs bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded">Author</span>
                  )}
                  {isCurrentUserReply && (
                    <span className="ml-2 text-xs text-blue-500">(You)</span>
                  )}
                </p>
                {isCurrentUserReply && (
                  <div className="comment-menu relative">
                    <button
                      onClick={e => { e.stopPropagation(); toggleMenu(reply.id); }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <span className="text-gray-500 text-xl">⋮</span>
                    </button>
                    {openMenuId === reply.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50 py-1">
                        <button
                          onClick={() => handleEditReply(reply.id)}
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
              <p className="text-xs text-gray-500">{new Date(reply.createdDate).toLocaleString()}</p>
              {editingReplyId === reply.id ? (
                <EditComment
                  comment={reply}
                  onSave={handleSaveReply}
                  onCancel={() => setEditingReplyId(null)}
                />
              ) : (
                <p className="mt-1 text-gray-700 text-sm">{reply.text}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RepliesView; 