import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, Calendar, Globe, Play, Heart, Bookmark, Check, Clapperboard, Sparkles
} from 'lucide-react';

import { api } from '../services/api';
import { userStorage } from '../services/userStorage';
import { normalizeMovie } from '../utils/movieUtils';
import { useToast } from './Toast';
import TrailerModal from './TrailerModal';

import './MovieDetailsPanel.css';
import FallbackPoster from './FallbackPoster';

export default function MovieDetailsPanel({
  movie,
  isOpen,
  onClose,
  onMovieSelect
}) {
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [isWatch, setIsWatch] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    if (!isOpen || !movie) {
      setSimilarMovies([]);
      return;
    }

    const normalized = normalizeMovie(movie) || movie;
    if (normalized) {
      userStorage.addToHistory(normalized);
      setIsFav(userStorage.isFavourite(normalized.movieId));
      setIsWatch(userStorage.isInWatchlist(normalized.movieId));
    }

    const fetchSimilar = async () => {
      const movieId = movie.movieId || movie.id;
      const title = movie.title || movie.Title;
      const year = movie.year || movie.Year;
      const language = movie.language || movie.Language || movie.language_code;

      if (!movieId && !title) {
        setSimilarMovies([]);
        return;
      }

      setLoadingSimilar(true);
      try {
        let result;
        if (movieId) {
          try {
            result = await Promise.race([
              api.getSimilarMovies(movieId, 10),
              new Promise((_, reject) => setTimeout(() => reject(new Error("Similar movies timeout")), 7000))
            ]);
          } catch (similarError) {
            console.warn("Local similar fallback:", similarError);
            result = await api.getExternalSimilarMovies(title, year, language, 10);
          }
        } else {
          result = await api.getExternalSimilarMovies(title, year, language, 10);
        }

        const movies = result?.similar_movies || result?.recommendations || [];
        setSimilarMovies(Array.isArray(movies) ? movies : []);
      } catch (error) {
        console.error('Failed to fetch similar movies:', error);
        setSimilarMovies([]);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilar();
  }, [isOpen, movie]);

  if (!movie) return null;

  const handleSimilarMovieSelect = async (sim) => {
    try {
      const imdbId = sim.imdbID || sim.imdb_id;
      if (imdbId) {
        const fullMovie = await api.getExternalMovieDetails(imdbId);
        if (fullMovie && typeof fullMovie === 'object' && !Array.isArray(fullMovie)) {
          onMovieSelect?.({
            ...sim,
            ...fullMovie,
            movieId: sim.movieId || fullMovie.movieId,
            imdbID: imdbId
          });
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load full similar movie details:', error);
    }
    onMovieSelect?.(sim);
  };

  const normalized = normalizeMovie(movie) || movie;
  const title = movie.title || 'Unknown Movie';
  const year = movie.year || '';
  const poster = movie.poster || null;
  const backdrop = movie.backdrop || null;
  const rating = movie.rating || null;
  const overview = movie.overview || 'No official synopsis is currently available for this title.';
  const language = movie.language || '';
  const director = movie.director || 'Director information is still being enriched.';
  const castList = movie.cast || [];
  const runtime = movie.runtime || '';
  const isExternal = movie.isExternal;

  const score = movie.recommendation?.score || 0;
  const reasons = movie.recommendation?.reasons || [];
  const genres = movie.genres || '';

  const hasTrailer = movie.trailer?.status !== 'not_found' && movie.trailer?.url;

  const handleTrailerClick = () => {
    if (!hasTrailer) return;
    if (movie.trailer.embedUrl) {
      setIsTrailerOpen(true);
    } else {
      window.open(movie.trailer.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleToggleFav = () => {
    if (!normalized) return;
    const added = userStorage.toggleFavourite(normalized);
    setIsFav(added);
    if (added && showToast) {
      showToast('Added to your cinema shelf', 'favourite');
    }
  };

  const handleToggleWatch = () => {
    if (!normalized) return;
    const added = userStorage.toggleWatchlist(normalized);
    setIsWatch(added);
    if (added && showToast) {
      showToast('Saved for your next watch', 'watchlist');
    }
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <div className="cinematic-modal-wrapper">
          <motion.div
            className="cinematic-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="cinematic-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <button className="cinematic-close-btn" onClick={onClose}>
              <X size={28} />
            </button>

            <div className="cinematic-scroll-content hide-scrollbar">
              {/* BACKDROP HEADER */}
              <div className="cinematic-backdrop-section">
                {backdrop ? (
                  <img src={backdrop} alt={`${title} backdrop`} className="cinematic-backdrop-img" />
                ) : poster ? (
                  <img src={poster} alt={`${title} backdrop`} className="cinematic-backdrop-img blur" />
                ) : (
                  <div className="cinematic-backdrop-img blank"></div>
                )}
                <div className="cinematic-backdrop-gradient"></div>
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="cinematic-main-content">
                
                {/* HERO: POSTER & TITLE */}
                <div className="cinematic-hero-row">
                  <div className="cinematic-poster-container">
                    {poster ? (
                      <img src={poster} alt={title} className="cinematic-poster-img" />
                    ) : (
                      <div className="cinematic-poster-fallback">
                        <Clapperboard size={48} opacity={0.3} />
                        <span className="fallback-title">{title}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="cinematic-title-area">
                    <h1>{title}</h1>
                    <div className="cinematic-meta-tags">
                      {rating && rating !== 'N/A' && (
                        <span className="c-meta"><Star size={16} fill="currentColor" className="text-gold" /> {rating}</span>
                      )}
                      {year && (
                        <span className="c-meta"><Calendar size={16} /> {year}</span>
                      )}
                      {language && (
                        <span className="c-meta"><Globe size={16} /> {language}</span>
                      )}
                    </div>
                    {genres && <p className="cinematic-genres">{genres}</p>}
                    
                    {/* ACTIONS */}
                    <div className="cinematic-actions">
                      {hasTrailer ? (
                        <button className="c-btn c-btn-primary" onClick={handleTrailerClick}>
                          <Play size={18} fill="currentColor" /> Watch Trailer
                        </button>
                      ) : (
                        <button className="c-btn c-btn-primary disabled" disabled>
                          Trailer Not Found
                        </button>
                      )}
                      
                      <button className={`c-btn c-btn-secondary ${isFav ? 'active' : ''}`} onClick={handleToggleFav}>
                        <Heart size={18} fill={isFav ? "currentColor" : "none"} /> 
                        {isFav ? 'Saved' : 'Favourite'}
                      </button>
                      
                      <button className={`c-btn c-btn-secondary ${isWatch ? 'active' : ''}`} onClick={handleToggleWatch}>
                        {isWatch ? <Check size={18} /> : <Bookmark size={18} />} 
                        {isWatch ? 'In Watchlist' : 'Watchlist'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* STORY */}
                <div className="cinematic-section story-section">
                  <h3 className="section-title">STORY</h3>
                  <p className="story-text">{overview}</p>
                </div>

                <div className="cinematic-row-split">
                  {/* CAST */}
                  <div className="cinematic-section cast-section">
                    <h3 className="section-title">CAST</h3>
                    {castList.length > 0 ? (
                      <div className="cast-grid">
                        {castList.map((actor, idx) => {
                          const initials = actor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                          return (
                            <div key={idx} className="cast-actor-card">
                              {actor.image ? (
                                <img src={actor.image} alt={actor.name} className="actor-avatar" />
                              ) : (
                                <div className="actor-avatar-fallback">{initials}</div>
                              )}
                              <div className="actor-info">
                                <span className="actor-name">{actor.name}</span>
                                {actor.character && <span className="actor-character">{actor.character}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="muted-text">Cast information is still being enriched.</p>
                    )}
                  </div>

                  {/* CREW */}
                  <div className="cinematic-section crew-section">
                    <h3 className="section-title">CREW</h3>
                    <div className="crew-item">
                      <span className="crew-role">Director</span>
                      <span className="crew-name">{director}</span>
                    </div>
                    {runtime && runtime !== 'N/A' && (
                      <div className="crew-item">
                        <span className="crew-role">Runtime</span>
                        <span className="crew-name">{runtime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI INTELLIGENCE */}
                {!isExternal && (
                  <div className="cinematic-section ai-section">
                    <div className="ai-header">
                      <Sparkles size={20} className="text-violet" />
                      <h3 className="section-title text-violet m-0">WHY RECOMMENDED?</h3>
                    </div>
                    
                    <div className="ai-explanation-box">
                      <div className="ai-score-ring">
                        <span className="score-val">{score > 0 ? score.toFixed(1) : '9.1'}</span>
                        <span className="score-lbl">Match</span>
                      </div>
                      <div className="ai-reasons">
                        <p>Recommended because you enjoyed movies with similar genres, themes, audience patterns and movie features.</p>
                        <ul className="ai-bullets">
                          {reasons.map((r, i) => <li key={i}>✓ {r}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* SIMILAR MOVIES */}
                {!isExternal && (
                  <div className="cinematic-section similar-section">
                    <h3 className="section-title">YOU MAY ALSO LIKE</h3>
                    
                    {loadingSimilar ? (
                      <div className="similar-loading">Finding cinematic connections...</div>
                    ) : similarMovies.length > 0 ? (
                      <div className="similar-grid">
                        {similarMovies.map((sim, idx) => {
                          const sTitle = sim.title || sim.Title || 'Unknown';
                          const sPoster = sim.poster || sim.Poster || null;
                          return (
                            <button key={idx} className="similar-card" onClick={() => handleSimilarMovieSelect(sim)}>
                              {sPoster && sPoster !== 'N/A' ? (
                                <img src={sPoster} alt={sTitle} />
                              ) : (
                                <div className="sim-fallback"><Clapperboard size={24} /></div>
                              )}
                              <span className="sim-title">{sTitle}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="muted-text">No similar movies found in the catalogue.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Trailer Modal mounted inside the panel so it can overlay everything */}
            <TrailerModal 
              isOpen={isTrailerOpen} 
              trailerUrl={movie.trailer?.url} 
              onClose={() => setIsTrailerOpen(false)} 
            />
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
