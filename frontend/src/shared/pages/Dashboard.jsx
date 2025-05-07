import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FollowRequests from '../components/FollowRequests';
import PostForm from '../../features/posts/PostForm';
import Modal from '../components/Modal';
import Feed from '../../features/posts/Feed';



function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [reloadFeed, setReloadFeed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUsername = localStorage.getItem('username');

      if (!token || !storedUsername) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:8081/api/v1/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Token verification failed');
        }

        const data = await response.json();
        if (data.valid) {
          setUsername(storedUsername);
        } else {
          throw new Error('Invalid token');
        }
      } catch (err) {
        console.error('Token verification error:', err);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handlePostCreated = (newPost) => {
    setShowPostForm(false);
    setReloadFeed(prev => !prev); 
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

  if (!username) {
    return null;
  }

  return (
    <div>
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Content (Scrollable) */}
          <div className="flex-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => navigate('/tutorials')}
                  className="flex items-center justify-start space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <span className="text-2xl">📚</span>
                  <span className="font-medium text-blue-700 group-hover:text-blue-800">Browse Tutorials</span>
                </button>
                <button 
                  onClick={() =>  setShowPostForm(true)}
                  className="flex items-center justify-start space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <span className="text-2xl">🎨</span>
                  <span className="font-medium text-green-700 group-hover:text-green-800">Create New Post</span>
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center justify-start space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <span className="text-2xl">🏆</span>
                  <span className="font-medium text-purple-700 group-hover:text-purple-800">View Achievements</span>
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Posts</h2>
                  <Feed reload={reloadFeed} /> {/* 🔥 pass reload prop */}
                </div>
              </div>
            </div>

          {/* Right Column - Sidebar (Fixed) */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Follow Requests */}

              <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Follow Requests</h3>
              <FollowRequests />
            </div>
             

              {/* Suggested Users */}
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Suggested to Follow</h2>
                <div className="space-y-4">
                  {/* Add suggested users content */}
                </div>
              </section>

              {/* Quick Links */}
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                    ⚙️ Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                    ❓ Help Center
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    🚪 Logout
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

    </div>
      <Footer />

      {/* Post Form Modal */}
      <Modal
        isOpen={showPostForm}
        onClose={() => setShowPostForm(false)}
        title="Create New Post"
      >
        <PostForm onSubmit={handlePostCreated} />
      </Modal>
    </div>
  );
}

export default Dashboard; 