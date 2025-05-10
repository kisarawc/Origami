import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CompletionPost = ({ post }) => {
  const { username, tutorialId, tutorialTitle, tutorialDifficulty, completedAt, completionImage } = post;

  // Format the date - handle both ISO string and MongoDB LocalDateTime format
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';

    // Directly check for the problematic date format
    if (dateString === '0-01-01 00:00:00') {
      return 'Recently';
    }

    try {
      // For debugging
      console.log('Date input:', typeof dateString, dateString);

      // Parse the date string
      let date;

      // Handle array format from Java LocalDateTime
      if (Array.isArray(dateString)) {
        // Format: [year, month, day, hour, minute, second, nano]
        const [year, month, day, hour, minute, second] = dateString;
        // Note: month in JavaScript Date is 0-indexed, but Java's is 1-indexed
        date = new Date(year, month - 1, day, hour, minute, second);
      }
      // Handle object format from Java LocalDateTime
      else if (typeof dateString === 'object' && dateString !== null && !Array.isArray(dateString)) {
        const year = dateString.year || 0;
        const month = dateString.monthValue || 1;
        const day = dateString.dayOfMonth || 1;
        const hour = dateString.hour || 0;
        const minute = dateString.minute || 0;
        const second = dateString.second || 0;

        // Month is 0-indexed in JavaScript Date
        date = new Date(year, month - 1, day, hour, minute, second);
      }
      // Handle ISO format strings with timezone like "2025-05-09T16:11:15.622+00:00"
      else if (typeof dateString === 'string' && dateString.includes('T') && dateString.includes('+')) {
        date = new Date(dateString);
      }
      // Handle ISO format strings
      else if (typeof dateString === 'string' && (dateString.includes('T') || dateString.includes('Z'))) {
        date = new Date(dateString);
      }
      // Handle format like "2023-06-15 14:30:00"
      else if (typeof dateString === 'string' && dateString.includes('-') && dateString.includes(':')) {
        date = new Date(dateString.replace(' ', 'T') + 'Z');
      }
      // Handle invalid date format like "0-01-01 00:00:00" or any date starting with "0-"
      else if (typeof dateString === 'string' && dateString.startsWith('0-')) {
        // Use "Recently" as fallback for invalid dates
        return 'Recently';
      }
      else {
        // Try direct parsing as last resort
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error, dateString);

      // For debugging
      if (typeof dateString === 'object') {
        console.log('Date object:', JSON.stringify(dateString));
      }

      // Return a reasonable fallback
      return 'Recently';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
    >
      <div className="p-6">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <Link to={`/profile/${username}`} className="font-medium text-gray-900 hover:underline">
                {username}
              </Link>
              <p className="text-sm text-gray-500">
                {formatDate(completedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(tutorialDifficulty)}`}>
              {tutorialDifficulty}
            </span>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            🎉 Completed: {tutorialTitle}
          </h3>
          <p className="text-gray-600">
            Successfully completed this origami tutorial! Check out my result below.
          </p>
        </div>

        {/* Image */}
        {completionImage && (
          <div className="mt-4">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={completionImage}
                alt={`Completed ${tutorialTitle}`}
                className="w-full h-64 object-contain bg-gray-50"
              />
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-end">
            <Link
              to={`/tutorials/${tutorialId}`}
              className="px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition-colors text-sm font-medium flex items-center"
            >
              <span>View Tutorial</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CompletionPost;
