import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TutorialList = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8081/api/v1/tutorials');
      if (!response.ok) {
        throw new Error('Failed to fetch tutorials');
      }
      const data = await response.json();
      setTutorials(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tutorials:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchTutorials}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!tutorials || tutorials.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No tutorials found</p>
        <Link
          to="/tutorials/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Create Your First Tutorial
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutorials.map((tutorial) => (
        <Link
          key={tutorial.id}
          to={`/tutorials/${tutorial.id}`}
          className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={tutorial.finalImage || 'https://placehold.co/400x300/CCCCCC/666666?text=No+Image'}
              alt={tutorial.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{tutorial.title}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{tutorial.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{tutorial.stepImages?.length || 0} steps</span>
              <span>{tutorial.difficulty}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TutorialList; 