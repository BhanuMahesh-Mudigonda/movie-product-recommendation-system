import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WelcomeScreen.css';

export default function WelcomeScreen({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 500);  // Reel visible
    const t2 = setTimeout(() => setStep(2), 1200); // Water & Fire flow
    const t3 = setTimeout(() => setStep(3), 2800); // Letter reveal
    const t4 = setTimeout(() => setStep(4), 4200); // Full universe title

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleEnterClick = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 850); // Smooth cinematic camera zoom time (850ms)
  };

  return (
    <AnimatePresence>
      <motion.div 
        className={`welcome-container ${isExiting ? 'cinematic-reel-zoom-exit' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.25, filter: 'blur(20px)', transition: { duration: 0.85 } }}
      >
        {/* CINEMATIC ATMOSPHERE LAYERS */}
        <div className="welcome-background">
          <div className={`water-flow-left ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`fire-flow-right ${step >= 2 ? 'active' : ''}`}></div>
          <div className="cinematic-film-grain"></div>
          <div className="cinematic-fog-layer"></div>
        </div>
        
        <div className="welcome-content">
          {/* MAIN ENTRY SYMBOL: METALLIC MOVIE REEL */}
          <motion.div 
            className="welcome-movie-reel-box"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: step >= 1 ? 1 : 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={`metallic-movie-reel ${isExiting ? 'reel-zoom-in' : ''}`}>
              <svg className="reel-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Rim */}
                <circle cx="50" cy="50" r="46" stroke="url(#reelRimGrad)" strokeWidth="4" />
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                {/* Center Hub */}
                <circle cx="50" cy="50" r="14" fill="#080c14" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                <circle cx="50" cy="50" r="6" fill="#ffffff" opacity="0.9" />
                {/* 6 Spoke Aperture Holes */}
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <circle 
                    key={i} 
                    cx={50 + 26 * Math.cos((deg * Math.PI) / 180)} 
                    cy={50 + 26 * Math.sin((deg * Math.PI) / 180)} 
                    r="9" 
                    fill="#040508" 
                    stroke="rgba(255,255,255,0.2)" 
                    strokeWidth="1.5" 
                  />
                ))}
                <defs>
                  <linearGradient id="reelRimGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00f2ff" />
                    <stop offset="0.5" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#ff6b35" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          {/* LETTER-BY-LETTER MOVIEMIND REVEAL */}
          {step >= 3 && (
            <div className="welcome-title-wrapper">
              <motion.span 
                className="title-movie"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                MOVIE
              </motion.span>
              <motion.span 
                className="title-mind"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                MIND
              </motion.span>
            </div>
          )}

          {/* THE CINEMATIC INTELLIGENCE UNIVERSE */}
          {step >= 4 && (
            <>
              <motion.p 
                className="welcome-universe-subtitle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                THE CINEMATIC INTELLIGENCE UNIVERSE
              </motion.p>

              <motion.p 
                className="tagline-signal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Discover &bull; Experience &bull; Remember
              </motion.p>
            </>
          )}

          {/* CINEMATIC ENTER PORTAL BUTTON */}
          <motion.div 
            className="cinematic-portal-trigger"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 4.5 }}
            onClick={handleEnterClick}
          >
            <div className="trigger-ring"></div>
            <span className="trigger-text">ENTER THE UNIVERSE &rarr;</span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
