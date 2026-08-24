import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './CinematicTransition.css';

export default function CinematicTransition({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800); // Transition duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="transition-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className="transition-bg"></div>
      
      <div className="film-strip-container">
        <motion.div 
          className="film-strip"
          initial={{ x: '100%' }}
          animate={{ x: '-100%' }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        >
          <div className="frame"></div>
          <div className="frame"></div>
          <div className="frame"></div>
          <div className="frame highlight-frame">
            <motion.div 
              className="frame-logo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              M
            </motion.div>
          </div>
          <div className="frame"></div>
          <div className="frame"></div>
        </motion.div>
      </div>

      <motion.div 
        className="zoom-overlay"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 20, opacity: 1 }}
        transition={{ delay: 2, duration: 0.8, ease: "circIn" }}
      ></motion.div>
    </motion.div>
  );
}
