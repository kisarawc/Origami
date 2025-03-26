import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './features/auth/pages/Login';
import Dashboard from './shared/pages/Dashboard';
import Profile from './shared/pages/Profile';
import logoImage from './assets/logo.png';

function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);

  const handleStartCreating = () => {
    navigate('/login');
  };

  const handleExploreTutorials = () => {
    navigate('/login');
  };

  const handleJoinFree = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />

        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
        
        {/* Floating Origami Elements */}
        <motion.div
          className="absolute w-40 h-40 bg-blue-100/70 rounded-lg backdrop-blur-sm"
          style={{ top: '15%', left: '5%' }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-32 h-32 bg-blue-100/70 rounded-lg backdrop-blur-sm"
          style={{ top: '60%', right: '10%' }}
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium">
              Welcome to the Art of Paper Folding
            </span>
          </motion.div>

          <motion.h1 
            className="text-7xl md:text-9xl font-bold mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="block text-gray-900 mb-4">Transform Paper</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Into Art
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover the ancient Japanese art of origami through interactive tutorials and step-by-step guides
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={handleStartCreating}
              className="group relative px-8 py-4 bg-blue-500 text-white rounded-lg text-lg font-medium overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="relative z-10">Start Creating</span>
              <div className="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
            <button 
              onClick={handleExploreTutorials}
              className="group px-8 py-4 bg-white border border-blue-100 rounded-lg text-lg font-medium text-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Explore Tutorials
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 8, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <div className="w-6 h-10 border-2 border-blue-200 rounded-full p-1">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mx-auto" />
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
                Explore Categories
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Choose Your Path
              </h2>
              <p className="text-gray-600 text-lg">
                From simple to complex, find the perfect origami project for your skill level
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              { 
                title: 'Beginner',
                count: '20+ tutorials',
                icon: '🌱',
                description: 'Perfect for those just starting their origami journey',
                color: 'from-blue-400 to-blue-500'
              },
              { 
                title: 'Intermediate',
                count: '35+ tutorials',
                icon: '🌿',
                description: 'Take your skills to the next level with more complex designs',
                color: 'from-blue-500 to-blue-600'
              },
              { 
                title: 'Advanced',
                count: '15+ tutorials',
                icon: '🌳',
                description: 'Challenge yourself with intricate and detailed models',
                color: 'from-blue-600 to-blue-700'
              },
            ].map((category) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`group relative bg-white rounded-2xl p-8 border border-blue-100 hover:border-blue-200 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl ${
                  activeCategory === category.title ? 'border-blue-400' : ''
                }`}
                onClick={() => setActiveCategory(category.title)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
                <div className="relative">
                  <div className="text-4xl mb-6">{category.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{category.title}</h3>
                  <p className="text-gray-600 mb-6">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">{category.count}</span>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-transparent"></div>
        <div className="container relative mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8">
                Join Our Community
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Join thousands of origami enthusiasts and start creating beautiful paper art today
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={handleJoinFree}
                  className="group relative px-8 py-4 bg-blue-500 text-white rounded-lg text-lg font-medium overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="relative z-10">Join Free</span>
                  <div className="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </button>
                <button className="group px-8 py-4 bg-white border border-blue-100 rounded-lg text-lg font-medium text-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg">
                  Learn More
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-100 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
      <div>
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <img 
                    src={logoImage} 
                    alt="Origami Logo" 
                    className="w-8 h-8 object-contain invert" 
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  Origami
                </span>
              </div>
              <p className="text-gray-600">
                Transforming simple paper into extraordinary art through the ancient practice of origami.
              </p>
            </div>
            {[
              {
                title: 'Learn',
                links: ['Tutorials', 'Techniques', 'Resources']
              },
              {
                title: 'Community',
                links: ['Forums', 'Events', 'Blog']
              },
              {
                title: 'Company',
                links: ['About', 'Contact', 'Privacy']
              }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
      </div>
          <div className="border-t border-blue-100 mt-12 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 Origami. All rights reserved.
        </p>
      </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
