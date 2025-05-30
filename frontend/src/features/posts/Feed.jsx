import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from './PostCard';

const Feed = ({ reload }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [deletingPostIds, setDeletingPostIds] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [reload]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8081/api/v1/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedPosts = response.data.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      });
      setPosts(sortedPosts);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts');
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handlePostDelete = (postId) => {
    setDeletingPostIds(ids => [...ids, postId]);
    setTimeout(() => {
      setPosts(posts => posts.filter(post => post.id !== postId));
      setDeletingPostIds(ids => ids.filter(id => id !== postId));
    }, 500); // Small delay to allow UI feedback
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-8">
      {error && (
        <div className="w-full max-w-[500px] bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {posts.filter(post => !deletingPostIds.includes(post.id)).length === 0 ? (
        <div className="w-full max-w-[500px] text-center py-12">
          <p className="text-gray-500 text-lg">No posts available</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to share something!</p>
        </div>
      ) : (
        posts.filter(post => !deletingPostIds.includes(post.id)).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostUpdate={handlePostUpdate}
            onPostDelete={() => handlePostDelete(post.id)}
            deleting={deletingPostIds.includes(post.id)}
            enableNavigation={false}
          />
        ))
      )}
    </div>
  );
};

export default Feed;
