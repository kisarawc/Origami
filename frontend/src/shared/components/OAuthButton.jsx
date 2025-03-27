import React from 'react';
import { motion } from 'framer-motion';

function OAuthButton({ provider, icon, onClick, isLoading }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <img src={icon} alt={`${provider} icon`} className="w-5 h-5" />
      <span className="text-sm font-medium text-gray-700">
        Continue with {provider}
      </span>
    </motion.button>
  );
}

export default OAuthButton; 