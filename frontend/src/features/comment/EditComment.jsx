import React, { useState } from 'react';
import axios from 'axios';

const EditComment = ({ comment, onSave, onCancel }) => {
  const [editText, setEditText] = useState(comment.text);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to edit comments');
        return;
      }

      await axios.put(`http://localhost:8081/comments/update`, {
        id: comment.id,
        text: editText
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      onSave(comment.id, editText);
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
    }
  };

  return (
    <div className="mt-3">
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
      <div className="mt-2 flex justify-end space-x-2">
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditComment; 