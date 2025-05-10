import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MyCreations() {
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const response = await axios.get(`http://localhost:8081/api/v1/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userPosts = response.data.filter(post => post.userName === username);
      const sortedPosts = userPosts.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      });
      
      setUserPosts(sortedPosts);
    } catch (err) {
      console.error('Failed to fetch user posts:', err);
      setError('Failed to load your posts');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setUserPosts(posts => posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handlePostDelete = (postId) => {
    setUserPosts(posts => posts.filter(post => post.id !== postId));
  };

  if (isLoadingPosts) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your creations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading posts</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (userPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <p className="text-gray-500 font-medium text-lg">No creations yet</p>
        <p className="text-gray-400 mt-2">Start creating and sharing your origami!</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Creations</h3>
        <button 
          onClick={() => navigate('/my-creations')}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
        >
          View All
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userPosts.slice(0, 4).map((post) => (
          <div
            key={post.id}
            onClick={() => navigate(`/post/${post.id}`)}
            className="group relative aspect-square bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            {post.imageUrls && post.imageUrls.length > 0 ? (
              <img
                src={post.imageUrls[0]}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : post.videoUrl ? (
              <video
                src={post.videoUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-medium text-sm truncate">{post.title}</h3>
                <p className="text-white/80 text-xs mt-1">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default MyCreations; 