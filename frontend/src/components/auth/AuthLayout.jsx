import React from 'react';
import { motion } from 'framer-motion';
import AuthBrandPanel from './AuthBrandPanel';
import AuthCard from './AuthCard';
import './Auth.css';

export default function AuthLayout({ onAuthSuccess }) {
  return (
    <motion.div 
      className="auth-layout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className="auth-ambient-glow-cyan"></div>
      <div className="auth-ambient-glow-violet"></div>
      <div className="auth-film-grain"></div>
      <div className="auth-particles"></div>

      <AuthBrandPanel />
      <AuthCard onAuthSuccess={onAuthSuccess} />
    </motion.div>
  );
}
