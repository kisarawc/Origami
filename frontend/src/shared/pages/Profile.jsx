import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('creations');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      if (!token || !username) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8081/api/v1/users/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                {userData?.name?.charAt(0) || userData?.username?.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600">
                📷
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{userData?.name || userData?.username}</h1>
              <p className="text-gray-500 mb-4">@{userData?.username}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">128</div>
                  <div className="text-sm text-gray-500">Creations</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">1.2k</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">943</div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
              </div>
              <p className="text-gray-700 max-w-2xl">
                {userData?.bio || "Passionate origami artist sharing my paper folding journey. Always learning, always creating! 🎨"}
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Edit Profile
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800">
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Achievement Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('creations')}
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'creations'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Creations
              </button>
              <button
                onClick={() => setActiveTab('tutorials')}
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'tutorials'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Tutorials
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'saved'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Saved
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'creations' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Add your creations content here */}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  No creations yet
                </div>
              </div>
            )}
            
            {activeTab === 'tutorials' && (
              <div className="text-center text-gray-500">
                No tutorials created yet
              </div>
            )}
            
            {activeTab === 'saved' && (
              <div className="text-center text-gray-500">
                No saved items yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      <Footer />
    </div>
  );
}

export default Profile; 