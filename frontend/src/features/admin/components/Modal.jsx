import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl"
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default Modal; 