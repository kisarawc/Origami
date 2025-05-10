import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentView from './CommentView';

const CommentSection = ({ postId, postAuthorId }) => {
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshComments, setRefreshComments] = useState(0);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      if (!token || !username) {
        setError('Please login to post comments');
        return;
      }

      const response = await axios.get(`http://localhost:8081/api/v1/users/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setCurrentUser({
          id: response.data.id,
          username: response.data.username,
          name: response.data.name,
          avatarUrl: response.data.avatarUrl
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to fetch user information. Please try again.');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

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
        createdBy: currentUser.id,
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
      // Trigger refresh of comments
      setRefreshComments(prev => prev + 1);
    } catch (err) {
      console.error('Error submitting comment:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(`Failed to post comment: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // Function to trigger refresh, to be passed to CommentView
  const triggerRefresh = () => setRefreshComments(prev => prev + 1);

  return (
    <div className="mt-4">
      {/* Comment Input Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {currentUser?.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-500">👤</span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <CommentView postId={postId} triggerRefresh={triggerRefresh} key={refreshComments} postAuthorId={postAuthorId} />
    </div>
  );
};

export default CommentSection;
