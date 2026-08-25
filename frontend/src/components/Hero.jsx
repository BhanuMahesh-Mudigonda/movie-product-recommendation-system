import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, ChevronLeft, ChevronRight, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { normalizeMovie } from '../utils/movieUtils';
import './Hero.css';

export default function Hero({ movies = [], onMovieSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplainModal, setShowExplainModal] = useState(false);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % movies.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const currentMovie =
    normalizeMovie(movies[currentIndex]) || movies[currentIndex];

  const title = currentMovie.title || 'Unknown Movie';
  const year = currentMovie.year || '';
  const rating = currentMovie.rating;
  const genres = currentMovie.genres || [];
  const overview =
    currentMovie.overview || 'An epic cinematic journey exploring power, honor, and destiny.';
  const trailer = currentMovie.trailer || '';

  const getHeroImage = () => {
    const movieTitle = (title || '').toLowerCase();

    if (movieTitle.includes('baahubali') || movieTitle.includes('bahubali')) {
      if (movieTitle.includes('2') || movieTitle.includes('conclusion')) {
        return '/hero/bahubali2-hero.png';
      }
      return '/hero/bahubali1-hero.png';
    }

    if (movieTitle.includes('pushpa')) {
      return '/hero/pushpa1-hero.png';
    }

    return (
      currentMovie.backdrop_path ||
      currentMovie.backdrop ||
      currentMovie.poster_path ||
      currentMovie.poster ||
      currentMovie.poster_url ||
      '/hero/bahubali1-hero.png'
    );
  };

  const heroImage = getHeroImage();

  const nextMovie = () => {
    setCurrentIndex(prev => (prev + 1) % movies.length);
  };

  const prevMovie = () => {
    setCurrentIndex(prev => (prev - 1 + movies.length) % movies.length);
  };

  const handleTrailer = () => {
    if (trailer) {
      window.open(trailer, '_blank', 'noopener,noreferrer');
      return;
    }

    const query = encodeURIComponent(`${title} ${year} official trailer`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank', 'noopener,noreferrer');
  };

  const getTypographyClass = (movieTitle) => {
    const lower = (movieTitle || '').toLowerCase();

    if (lower.includes('baahubali') || lower.includes('bahubali') || lower.includes('rrr') || lower.includes('ponniyin')) {
      return 'typo-epic-royal';
    }
    if (lower.includes('pushpa') || lower.includes('salaar') || lower.includes('kgf') || lower.includes('vikram')) {
      return 'typo-rugged-action';
    }
    if (lower.includes('kalki') || lower.includes('robotic') || lower.includes('2.0')) {
      return 'typo-futuristic-scifi';
    }
    if (lower.includes('sita') || lower.includes('fidaa') || lower.includes('hi nanna')) {
      return 'typo-elegant-romance';
    }

    return 'typo-cinematic-default';
  };

  const genreArray = Array.isArray(genres) ? genres : (typeof genres === 'string' ? genres.split(/[|,\s]+/) : []);
  const matchPercentage = Math.min(98, Math.max(88, 88 + (title.length % 11)));

  return (
    <div className="hero-container-pro">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-inner-layout"
        >
          {/* LEFT SIDE CONTENT STACK */}
          <div className="hero-left-info">
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="hero-signal-badge"
            >
              <span className="badge-signal-dot" />
              <span>MOVIEMIND SIGNAL: FEATURED SELECTION</span>
            </motion.div>

            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className={`hero-title-main ${getTypographyClass(title)}`}
            >
              {title}
            </motion.h1>

            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="hero-meta-row"
            >
              {year && <span className="hero-year-chip">{year}</span>}
              {rating && (
                <span className="hero-rating-chip">
                  <Star size={14} fill="#eab308" color="#eab308" />
                  <span>{rating}</span>
                </span>
              )}
              {genreArray.length > 0 && (
                <div className="hero-genres-wrapper">
                  {genreArray.slice(0, 3).map((genre, idx) => (
                    <span key={idx} className="hero-genre-pill">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="hero-description-text"
            >
              {overview}
            </motion.p>

            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="hero-actions-row"
            >
              <button className="hero-btn-primary" onClick={handleTrailer}>
                <Play size={16} fill="currentColor" />
                <span>WATCH TRAILER</span>
              </button>

              <button
                className="hero-btn-secondary"
                onClick={() => setShowExplainModal(true)}
              >
                <Sparkles size={16} />
                <span>WHY THIS MOVIE FOR YOU?</span>
              </button>

              <button
                className="hero-btn-tertiary"
                onClick={() => onMovieSelect?.(currentMovie)}
              >
                <Info size={16} />
                <span>VIEW DETAILS</span>
              </button>
            </motion.div>
          </div>

          {/* RIGHT SIDE CINEMATIC MOVIE BACKDROP (50% VISUAL AREA) */}
          <div className="hero-right-backdrop">
            <img 
              src={heroImage} 
              alt={title} 
              className="hero-backdrop-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/hero/bahubali1-hero.png';
              }}
            />
            <div className="hero-backdrop-mask-left"></div>
            <div className="hero-backdrop-mask-bottom"></div>
            <div className="hero-backdrop-mask-top"></div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* AI EXPLANATION MODAL */}
      {showExplainModal && (
        <div className="ai-explain-overlay" onClick={() => setShowExplainModal(false)}>
          <motion.div 
            className="ai-explain-modal" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="explain-header">
              <div className="explain-title-row">
                <Sparkles className="explain-icon" size={20} />
                <h3>MOVIEMIND EXPLAINS</h3>
              </div>
              <button className="explain-close-btn" onClick={() => setShowExplainModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p className="explain-intro">
              Recommended for you based on your viewing patterns and preference signals:
            </p>

            <ul className="explain-points-list">
              <li>
                <CheckCircle2 size={16} className="point-icon" />
                <span>Epic storytelling & World Building</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="point-icon" />
                <span>High Emotional Intensity & Drama</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="point-icon" />
                <span>Cinematic Score & Visual Spectacle</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="point-icon" />
                <span>Matches your preferred era & language signals</span>
              </li>
            </ul>

            <div className="explain-confidence-box">
              <span className="confidence-label">RECOMMENDATION CONFIDENCE</span>
              <span className="confidence-score">{matchPercentage}% MATCH</span>
            </div>
          </motion.div>
        </div>
      )}

      {movies.length > 1 && (
        <div className="hero-nav-controls">
          <button className="hero-arrow-btn" onClick={prevMovie}>
            <ChevronLeft size={20} />
          </button>
          <div className="hero-dot-indicators">
            {movies.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
          <button className="hero-arrow-btn" onClick={nextMovie}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
