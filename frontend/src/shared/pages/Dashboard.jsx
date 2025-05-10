import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FollowRequests from '../components/FollowRequests';
import CompletionPost from '../../components/CompletionPost';
import { postService } from '../../services/postService';
import CommentSection from '../../features/comment/comment';
import OrigamiButterfly from '../../assets/Origami_butterfly.jpg';
import OrigamiButterfly2 from '../../assets/Origami_butterfly2.jpg';
import OrigamiFish1 from '../../assets/Origami_Fish1.jpg';
import OrigamiFish2 from '../../assets/Origami_Fish2.jpg';

// Updated post data with actual posts
const samplePosts = [
  {
    _id: "680a55ea87f7e260a9d2ae75",
    title: "Origami Butterfly",
    description: "Today I just created a beautiful Origami Butterfly successfully",
    imageUrls: [OrigamiButterfly, OrigamiButterfly2],
    userId: "67eacc8ffdda7b765ca3ff43",
    userName: "esandiabeysinghe",
    createdAt: "2025-04-24T15:16:58.603+00:00",
    updatedAt: "2025-04-24T15:19:49.376+00:00"
  },
  ,
  {
    _id: "681b47e47150774f25a646fb",
    title: "Elegant Origami Crane Display",
    description: "Folding this crane felt peaceful and meaningful😊. Each crease brought a sense of calm, and seeing it take shape reminded me why I love paper art",
    imageUrls: [OrigamiFish1, OrigamiFish2],
    userId: "67ff9acbc9de7b3b152363dd",
    userName: "Tharushi",
    createdAt: "2025-05-07T11:45:40.155+00:00",
    updatedAt: "2025-05-07T11:45:40.155+00:00"
  },
  {
    _id: "680a5b8e87f7e260a9d2ae76",
    title: "Simple Origami Fish",
    description: "A step-by-step guide to making an easy origami fish",
    imageUrls: [OrigamiFish1, OrigamiFish2],
    userId: "67eacc8ffdda7b765ca3ff43",
    userName: "esandiabeysinghe",
    createdAt: "2025-04-24T15:41:02.886+00:00",
    updatedAt: "2025-04-24T15:42:37.296+00:00"
  }
];

// Post component
const Post = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-2xl">👤</div>
        <div>
          <p className="font-semibold">{post.userName}</p>
          <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
      
      {post.description && (
        <p className="mb-4 text-gray-700">{post.description}</p>
      )}

      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {post.imageUrls.map((url, index) => (
            <img 
              key={index}
              src={url}
              alt={`${post.title} image ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <div className="flex items-center space-x-4 mb-4">
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
        >
          <span>❤️</span>
          <span>{likeCount}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-gray-500"
        >
          <span>💬</span>
          <span>Comments</span>
        </button>
      </div>
      
      {showComments && <CommentSection postId={post._id} />}
    </div>
  );
};

// PostFeed component
const PostFeed = () => {
  return (
    <div className="space-y-4">
      {samplePosts.map(post => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};


function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completionPosts, setCompletionPosts] = useState([]);

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

          // Load all completion posts for the social feed
          const fetchPosts = async () => {
            try {
              const allPosts = await postService.getAllCompletionPosts();
              setCompletionPosts(allPosts);
              console.log('Loaded all completion posts:', allPosts);
            } catch (postsError) {
              console.error('Error loading completion posts:', postsError);
            }
          };

          fetchPosts();
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
                  onClick={() => navigate('/create')}
                  className="flex items-center justify-start space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <span className="text-2xl">🎨</span>
                  <span className="font-medium text-green-700 group-hover:text-green-800">Create New Post</span>
                </button>

                <button
                  onClick={() => navigate('/achievements')}

                <button 
                  onClick={() => navigate('/profile')}

                  className="flex items-center justify-start space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <span className="text-2xl">🏆</span>
                  <span className="font-medium text-purple-700 group-hover:text-purple-800">View Achievements</span>
                </button>
              </div>
            </div>

            {/* Completion Posts Feed */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Origami Tutorials</h2>

                {completionPosts.length > 0 ? (
                  <div className="space-y-6">
                    {completionPosts.map(post => (
                      <CompletionPost key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-5xl mb-4">🏆</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No completed tutorials yet</h3>
                    <p className="text-gray-500 mb-4">
                      Complete a tutorial to see your achievements here!
                    </p>
                    <button
                      onClick={() => navigate('/tutorials')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Tutorials
                    </button>
                  </div>
                )}

            {/* Posts Feed */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Feed</h2>
                <PostFeed />

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
    </div>
  );
}

export default Dashboard;