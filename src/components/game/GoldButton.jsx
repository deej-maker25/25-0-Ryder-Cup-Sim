import React from 'react';
import { motion } from 'framer-motion';

export default function GoldButton({ children, onClick, disabled = false, className = "" }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </motion.button>
  );
}
