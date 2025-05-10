import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CompletionPost from '../components/CompletionPost';
import { postService } from '../services/postService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    
    if (!username || !token) {
      navigate('/login');
      return;
    }
    
    setUser({ username });
    
    // Load completion posts
    const userPosts = postService.getUserPosts();
    setPosts(userPosts);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user?.username}!</h1>
        <p className="text-gray-600">Track your origami journey and see your completed tutorials.</p>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Your Achievements</h2>
          <Link to="/tutorials" className="text-blue-600 hover:text-blue-800 font-medium">
            Find more tutorials →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{posts.length}</div>
            <div className="text-gray-600">Completed Tutorials</div>
          </div>
          
          {/* Add more achievement cards as needed */}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Completions</h2>
        
        {posts.length > 0 ? (
          <div>
            {posts.map(post => (
              <CompletionPost key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No completions yet</h3>
            <p className="text-gray-500 mb-4">
              You haven't completed any tutorials yet. Start folding and track your progress!
            </p>
            <Link
              to="/tutorials"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Tutorials
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
