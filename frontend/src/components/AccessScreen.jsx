import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Smartphone, UserCircle2 } from 'lucide-react';
import './AccessScreen.css';

export default function AccessScreen({ onGuestEntry }) {
  return (
    <motion.div 
      className="access-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className="access-background">
        <div className="film-grain"></div>
        <div className="gradient-overlay"></div>
      </div>

      <motion.div 
        className="access-modal"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="access-header">
          <h2>Access Your World</h2>
          <p>Choose how you want to continue</p>
        </div>

        <div className="access-options">
          <button className="access-btn outline-btn" onClick={() => alert('Frontend placeholder. Backend auth not implemented.')}>
            <Mail size={20} />
            Continue with Email
          </button>
          
          <button className="access-btn outline-btn" onClick={() => alert('Frontend placeholder. Backend auth not implemented.')}>
            <Smartphone size={20} />
            Continue with Phone
          </button>
          
          <div className="access-divider">
            <span>or</span>
          </div>
          
          <button className="access-btn primary-btn" onClick={onGuestEntry}>
            <UserCircle2 size={20} />
            Continue as Guest
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
