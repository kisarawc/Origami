import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../shared/components/Header';
import Footer from '../../../shared/components/Footer';
import PostCard from '../PostCard';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8081/api/v1/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost(response.data);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      setError('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPost(updatedPost);
  };

  const handlePostDelete = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading post...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
              <p className="font-medium">Error loading post</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : post ? (
          <PostCard
            post={post}
            onPostUpdate={handlePostUpdate}
            onPostDelete={handlePostDelete}
            isDetailView={true}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium text-lg">Post not found</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default PostDetail; 