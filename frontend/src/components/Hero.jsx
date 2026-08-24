import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { normalizeMovie } from '../utils/movieUtils';
import './Hero.css';

export default function Hero({ movies = [], onMovieSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0);

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
    currentMovie.overview || 'Movie details are currently unavailable.';
  const trailer = currentMovie.trailer || '';

  const getHeroImage = () => {
    const movieTitle = (currentMovie.title || '').toLowerCase();

    if (movieTitle.includes('baahubali') || movieTitle.includes('bahubali')) {
      if (
        movieTitle.includes('2') ||
        movieTitle.includes('conclusion')
      ) {
        return '/hero/bahubali2-hero.png';
      }

      return '/hero/bahubali1-hero.png';
    }

    if (movieTitle.includes('pushpa')) {
      return '/hero/pushpa1-hero.png';
    }

    return currentMovie.backdrop || currentMovie.poster || '';
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

    const query = encodeURIComponent(
      `${title} ${year} official trailer`
    );

    window.open(
      `https://www.youtube.com/results?search_query=${query}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <section className="hero-section">

      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentMovie.movieId || currentMovie.id}-${currentIndex}`}
          className="hero-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          {heroImage && (
            <img
              src={heroImage}
              alt={title}
              className="hero-backdrop-image"
            />
          )}

          <div className="hero-gradient-overlay" />
        </motion.div>
      </AnimatePresence>

      <div className="hero-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentMovie.movieId || currentMovie.id}-${currentIndex}`}
            className="hero-info-card"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.5 }}
          >

            <div className="hero-badge">
              FEATURED MOVIE
            </div>

            <h1 className="hero-title">
              {title}
            </h1>

            <div className="hero-meta">

              {rating && rating !== 'N/A' && (
                <div className="hero-rating">
                  <Star size={16} fill="currentColor" />
                  <span>{Number(rating).toFixed(1)}</span>
                </div>
              )}

              {year && (
                <span className="hero-year">
                  {year}
                </span>
              )}

              {genres.slice(0, 3).map((genre, index) => (
                <span
                  key={`${genre}-${index}`}
                  className="genre-pill"
                >
                  {genre}
                </span>
              ))}

            </div>

            <p className="hero-plot">
              {overview.length > 260
                ? `${overview.substring(0, 260)}...`
                : overview}
            </p>

            <div className="hero-actions-row">

              <button
                className="hero-btn primary"
                onClick={handleTrailer}
              >
                <Play size={19} fill="currentColor" />
                <span>Watch Trailer</span>
              </button>

              <button
                className="hero-btn secondary"
                onClick={() => onMovieSelect?.(currentMovie)}
              >
                <Info size={19} />
                <span>View Details</span>
              </button>

            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      {movies.length > 1 && (
        <>
          <button
            className="hero-arrow hero-arrow-left"
            onClick={prevMovie}
          >
            <ChevronLeft size={25} />
          </button>

          <button
            className="hero-arrow hero-arrow-right"
            onClick={nextMovie}
          >
            <ChevronRight size={25} />
          </button>

          <div className="hero-dots">
            {movies.slice(0, 3).map((_, index) => (
              <button
                key={index}
                className={`hero-dot ${
                  index === currentIndex ? 'active' : ''
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}

      <div className="hero-fade-bottom" />

    </section>
  );
}
