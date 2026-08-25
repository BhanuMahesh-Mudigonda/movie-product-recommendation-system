import React from 'react';
import { motion } from 'framer-motion';

export default function AuthBrandPanel() {
  return (
    <div className="auth-brand-panel">
      <motion.div 
        className="brand-story-composition"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        {/* SMALL LABEL */}
        <div className="studio-signal-badge">
          <span className="signal-dot"></span>
          <span className="signal-text">CINEMATIC INTELLIGENCE SIGNAL</span>
        </div>
        
        {/* LARGE HERO TITLE (PRIMARY FOCAL POINT) */}
        <h1 className="moviemind-hero-wordmark">
          <span className="word-movie">MOVIE</span><span className="word-mind">MIND</span>
        </h1>

        {/* SUBTITLE */}
        <h2 className="studio-universe-subtitle">
          THE CINEMATIC INTELLIGENCE UNIVERSE
        </h2>

        {/* MEANINGFUL STORYTELLING DESCRIPTION */}
        <p className="studio-story-desc">
          &ldquo;Where stories become signals, emotions become patterns, and every frame helps MovieMind understand what you love.&rdquo;
        </p>

        {/* BOTTOM SLOGAN BADGE */}
        <div className="studio-slogan-row">
          <span className="slogan-dot"></span>
          <span className="slogan-words">DISCOVER &bull; EXPERIENCE &bull; REMEMBER</span>
        </div>
      </motion.div>
    </div>
  );
}
