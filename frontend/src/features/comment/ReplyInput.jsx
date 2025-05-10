import React, { useState } from 'react';
import axios from 'axios';

const ReplyInput = ({ parentCommentId, postId, onSuccess, onCancel }) => {
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      if (!token || !username) {
        setError('Please login to reply');
        setIsSubmitting(false);
        return;
      }
      // Fetch current user for ID
      const userRes = await axios.get(`http://localhost:8081/api/v1/users/${username}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userId = userRes.data.id;
      const replyData = {
        postId,
        parentCommentId,
        createdBy: userId,
        text: replyText,
        createdDate: new Date().toISOString()
      };
      await axios.post('http://localhost:8081/comments/create', replyData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setReplyText('');
      setError(null);
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setIsSubmitting(false);
      setError('Failed to post reply. Please try again.');
    }
  };

  return (
    <form onSubmit={handleReply} className="mt-2 ml-8">
      <textarea
        value={replyText}
        onChange={e => setReplyText(e.target.value)}
        placeholder="Write a reply..."
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={2}
        disabled={isSubmitting}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      <div className="flex space-x-2 mt-1 justify-end">
        <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600" disabled={isSubmitting}>Reply</button>
        <button type="button" className="px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
      </div>
    </form>
  );
};

export default ReplyInput; 