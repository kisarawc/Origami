import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../../assets/logo.png';

function AdminDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src={logoImage} alt="Origami" />
                <span className="ml-2 text-xl font-bold text-gray-900">Origami Admin</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-blue-600 border-b-2 border-blue-600 pb-1 ml-30">Badge System</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">@{username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge System Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                onClick={() => navigate('/admin/create-badge')}
              >
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Create Badge</h3>
                <p className="text-blue-700 text-sm">Design and create new badges for achievements</p>
              </div>
              <div 
                className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                onClick={() => navigate('/admin/current-badges')}
              >
                <h3 className="text-lg font-semibold text-green-900 mb-2">Current Badges</h3>
                <p className="text-green-700 text-sm">View and manage existing badges</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 