import React from 'react';
import { motion } from 'framer-motion';

const AchievementBadges = ({ badges }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `Earned ${date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}`;
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Achievement Badges</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge._id || badge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gradient-to-tl from-blue-100 to-blue-50  rounded-lg p-6 hover:shadow-md transition-all"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-4xl mb-2">
                {badge.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {badge.name}
              </h3>
              <p className="text-sm text-gray-600">
                {badge.description}
              </p>
              {badge.earnedAt && (
                <p className="text-sm text-blue-500 font-medium">
                  {formatDate(badge.earnedAt)}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AchievementBadges; 