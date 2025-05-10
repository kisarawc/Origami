// Post Service - Handles fetching completion posts from the backend API

// API base URL
const API_BASE_URL = 'http://localhost:8081/api/v1';

// Get all completion posts for the social feed
const getAllCompletionPosts = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/completed-tutorials/feed`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch completion posts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform the data to match the format expected by the frontend
    return data.map(post => {
      // Format the date from Java LocalDateTime to JavaScript Date format
      let formattedDate;

      if (post.completedAt) {
        // Handle different formats of completedAt
        if (typeof post.completedAt === 'string') {
          // If it's a string, try to format it
          formattedDate = post.completedAt.replace('T', ' ').substring(0, 19);
        } else if (typeof post.completedAt === 'object') {
          // If it's an object (Java LocalDateTime serialized as JSON)
          try {
            const year = post.completedAt.year || 0;
            const month = (post.completedAt.monthValue || 1).toString().padStart(2, '0');
            const day = (post.completedAt.dayOfMonth || 1).toString().padStart(2, '0');
            const hour = (post.completedAt.hour || 0).toString().padStart(2, '0');
            const minute = (post.completedAt.minute || 0).toString().padStart(2, '0');
            const second = (post.completedAt.second || 0).toString().padStart(2, '0');

            formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
          } catch (e) {
            console.error('Error formatting date object:', e);
            formattedDate = new Date().toISOString();
          }
        } else {
          // Fallback
          formattedDate = new Date().toISOString();
        }
      } else {
        // If no date provided
        formattedDate = new Date().toISOString();
      }

      return {
        id: post.id,
        username: post.userUsername,
        tutorialId: post.tutorialId,
        tutorialTitle: post.tutorialTitle,
        tutorialDifficulty: post.tutorialDifficulty,
        completionImage: post.completionImage,
        completedAt: formattedDate
      };
    });
  } catch (error) {
    console.error('Error fetching completion posts:', error);
    return [];
  }
};

// Get posts for the current user
const getUserPosts = async (username) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/completed-tutorials`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user completion posts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform the data to match the format expected by the frontend
    return data.map(post => {
      // Format the date from Java LocalDateTime to JavaScript Date format
      let formattedDate;

      if (post.completedAt) {
        // Handle different formats of completedAt
        if (typeof post.completedAt === 'string') {
          // If it's a string, try to format it
          formattedDate = post.completedAt.replace('T', ' ').substring(0, 19);
        } else if (typeof post.completedAt === 'object') {
          // If it's an object (Java LocalDateTime serialized as JSON)
          try {
            const year = post.completedAt.year || 0;
            const month = (post.completedAt.monthValue || 1).toString().padStart(2, '0');
            const day = (post.completedAt.dayOfMonth || 1).toString().padStart(2, '0');
            const hour = (post.completedAt.hour || 0).toString().padStart(2, '0');
            const minute = (post.completedAt.minute || 0).toString().padStart(2, '0');
            const second = (post.completedAt.second || 0).toString().padStart(2, '0');

            formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
          } catch (e) {
            console.error('Error formatting date object:', e);
            formattedDate = new Date().toISOString();
          }
        } else {
          // Fallback
          formattedDate = new Date().toISOString();
        }
      } else {
        // If no date provided
        formattedDate = new Date().toISOString();
      }

      return {
        id: post.id,
        username: post.userUsername,
        tutorialId: post.tutorialId,
        tutorialTitle: post.tutorialTitle,
        tutorialDifficulty: post.tutorialDifficulty,
        completionImage: post.completionImage,
        completedAt: formattedDate
      };
    });
  } catch (error) {
    console.error('Error fetching user completion posts:', error);
    return [];
  }
};

export const postService = {
  getAllCompletionPosts,
  getUserPosts
};
