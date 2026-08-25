import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './CinematicTransition.css';

export default function CinematicTransition({ onComplete }) {
  const [statusIndex, setStatusIndex] = useState(0);

  const statusMessages = [
    'INITIALIZING MOVIEMIND SIGNAL',
    'READING YOUR CINEMATIC PROFILE',
    'MATCHING STORY PATTERNS',
    'BUILDING YOUR MOVIE UNIVERSE',
    'SIGNAL LOCKED'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex(prev => {
        if (prev < statusMessages.length - 1) return prev + 1;
        return prev;
      });
    }, 500);

    const timer = setTimeout(() => {
      onComplete?.();
    }, 2600); // 2.6s total transition sequence

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="cinematic-portal-transition-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(16px)', transition: { duration: 0.6 } }}
    >
      {/* CINEMATIC FOCUS & VIGNETTE LAYER */}
      <div className="portal-focus-vignette"></div>
      <div className="portal-film-grain"></div>
      <div className="film-light-projection"></div>

      <div className="portal-transition-content">
        {/* ROTATING 3D METALLIC MOVIE REEL */}
        <motion.div 
          className="portal-movie-reel-box"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="metallic-projector-reel">
            <svg className="projector-reel-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" stroke="url(#portalReelRim)" strokeWidth="3.5" />
              <circle cx="50" cy="50" r="41" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="14" fill="#05080d" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
              <circle cx="50" cy="50" r="6" fill="#ffffff" />
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <circle 
                  key={i} 
                  cx={50 + 26 * Math.cos((deg * Math.PI) / 180)} 
                  cy={50 + 26 * Math.sin((deg * Math.PI) / 180)} 
                  r="9" 
                  fill="#040508" 
                  stroke="rgba(255,255,255,0.25)" 
                  strokeWidth="1.5" 
                />
              ))}
              <defs>
                <linearGradient id="portalReelRim" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00f2ff" />
                  <stop offset="0.5" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#ff6b35" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>

        {/* SEQUENTIAL AI STATUS MESSAGES */}
        <motion.h2 
          key={statusIndex}
          className="portal-status-heading"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {statusMessages[statusIndex]}
        </motion.h2>

        <p className="portal-status-sub">Personalizing your MovieMind experience...</p>

        {/* PROGRESS BAR */}
        <div className="portal-progress-bar">
          <div 
            className="portal-progress-fill"
            style={{ width: `${((statusIndex + 1) / statusMessages.length) * 100}%` }}
          ></div>
        </div>

        {/* THREE MINIMAL PULSING DOTS */}
        <div className="portal-dots-row">
          <span className={`dot-pulse ${statusIndex >= 0 ? 'active' : ''}`}></span>
          <span className={`dot-pulse ${statusIndex >= 2 ? 'active' : ''}`}></span>
          <span className={`dot-pulse ${statusIndex >= 4 ? 'active' : ''}`}></span>
        </div>
      </div>

      {/* FINAL PORTAL LIGHT SWEEP */}
      <div className="final-portal-light-sweep"></div>
    </motion.div>
  );
}
