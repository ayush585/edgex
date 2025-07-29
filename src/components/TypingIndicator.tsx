// src/components/TypingIndicator.jsx

import React from 'react';
import { motion } from 'framer-motion';

// Parent container variants: its only job is to manage the timing.
const containerVariants = {
  initial: {
    // We can define an initial state if needed, but it's not required here.
  },
  animate: {
    transition: {
      // This creates a delay between the start of each child's animation.
      staggerChildren: 0.2, 
    },
  },
};

// Child dot variants: this defines the complete animation for a single dot.
const dotVariants = {
  initial: {
    y: "0%", // The dot starts at its natural position.
  },
  animate: {
    y: "-100%", // The dot moves up by 100% of its height.
    
    // The transition for this movement is defined *inside* the target state.
    // This is the key to fixing the error.
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
};


const TypingIndicator = () => {
  return (
    // This is the PARENT component that orchestrates the animation.
    <motion.div
      className="flex items-center justify-center space-x-1.5 p-2 h-8"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <span className="sr-only">Typing...</span>
      
      {/* These are the CHILDREN. They inherit the "animate" command from the parent. */}
      {/* They only need the `variants` prop to know how to behave. */}
      <motion.div
        className="h-2 w-2 bg-gray-500 rounded-full"
        variants={dotVariants}
      />
      <motion.div
        className="h-2 w-2 bg-gray-500 rounded-full"
        variants={dotVariants}
      />
      <motion.div
        className="h-2 w-2 bg-gray-500 rounded-full"
        variants={dotVariants}
      />
    </motion.div>
  );
};

export default TypingIndicator;
