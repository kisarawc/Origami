import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TutorialList from '../components/TutorialList';
import CreateTutorial from '../components/CreateTutorial';
import TutorialDetail from '../components/TutorialDetail';
import MyTutorials from '../components/MyTutorials';
import EditTutorial from '../components/EditTutorial';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';

const Tutorials = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Origami Tutorials</h1>
              <p className="text-gray-600 text-lg">Discover and create beautiful origami designs</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link
                to="/tutorials"
                className="group relative px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Browse Tutorials</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  to="/tutorials/create"
                  className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Tutorial</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/tutorials/my-tutorials"
                  className="group relative px-6 py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl font-semibold overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>My Tutorials</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 lg:p-16 w-full max-w-5xl mx-auto">
              <Routes>
                <Route path="/" element={<TutorialList />} />
                <Route path="/create" element={<CreateTutorial />} />
                <Route path="/:id" element={<TutorialDetail />} />
                <Route path="/my-tutorials" element={<MyTutorials />} />
                <Route path="/edit/:id" element={<EditTutorial />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Tutorials; 