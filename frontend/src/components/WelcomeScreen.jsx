import React from 'react';
import { motion } from 'framer-motion';
import './WelcomeScreen.css';

export default function WelcomeScreen({ onComplete }) {
  return (
    <motion.div 
      className="welcome-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      <div className="welcome-background">
        <div className="film-grain"></div>
        <div className="floating-particles"></div>
      </div>
      
      <div className="welcome-content">
        <motion.div 
          className="welcome-logo"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span className="logo-m">M</span>
          <span className="logo-text">MOVIEMIND</span>
        </motion.div>

        <motion.p 
          className="welcome-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          Your next story begins here.
        </motion.p>

        <motion.button 
          className="welcome-btn"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 2.5 }}
          onClick={onComplete}
        >
          ENTER YOUR CINEMATIC WORLD
        </motion.button>
      </div>
    </motion.div>
  );
}
