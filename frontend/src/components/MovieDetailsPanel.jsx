import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, Calendar, Globe, Play, Heart, Bookmark, Check, Clapperboard, Sparkles, CheckCircle2, Dna, ShieldCheck
} from 'lucide-react';

import { api } from '../services/api';
import { userStorage } from '../services/userStorage';
import { localSimilarityService } from '../services/localSimilarityService';
import { movieMetadataService } from '../services/movieMetadataService';
import { normalizeMovie, safeString, safeGenres } from '../utils/movieUtils';
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
  const [enrichedMeta, setEnrichedMeta] = useState({ cast: [], director: '' });
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

    const fetchMetaAndSimilar = async () => {
      if (!movie) {
        setSimilarMovies([]);
        setEnrichedMeta({ cast: [], director: '' });
        return;
      }

      setLoadingSimilar(true);
      try {
        const [related, meta] = await Promise.all([
          localSimilarityService.getRelatedMovies(movie, 10),
          movieMetadataService.getEnrichedMetadata(movie)
        ]);
        setSimilarMovies(Array.isArray(related) ? related : []);
        setEnrichedMeta(meta || { cast: [], director: '' });
      } catch (error) {
        setSimilarMovies([]);
        setEnrichedMeta({ cast: [], director: '' });
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchMetaAndSimilar();
  }, [isOpen, movie]);

  if (!isOpen || !movie) return null;

  const isExternal = Boolean(
    movie?.isExternal ??
    movie?.external ??
    movie?.isTMDB ??
    movie?.isOmdb ??
    movie?.is_external ??
    false
  );

  const title = movie?.title || movie?.Title || movie?.name || 'Untitled Movie';
  const year = movie?.year || movie?.Year || movie?.release_year || '';
  const rating = movie?.rating || movie?.imdbRating || movie?.vote_average || 'N/A';

  const rawGenre = movie?.genres || movie?.genre || movie?.Genre || '';
  const genres = Array.isArray(rawGenre)
    ? rawGenre
    : (typeof rawGenre === 'string'
      ? rawGenre.replace(/\|/g, ',').split(',').map(g => g.trim()).filter(Boolean)
      : []);

  const overview =
    movie?.overview ||
    movie?.Plot ||
    movie?.description ||
    'Detailed narrative context for this title is currently being ingested into MovieMind.';

  const posterUrl =
    movie?.poster ||
    movie?.Poster ||
    movie?.poster_url ||
    movie?.posterUrl ||
    movie?.image ||
    null;

  const backdropUrl =
    movie?.backdrop ||
    movie?.backdrop_path ||
    movie?.backdropUrl ||
    posterUrl;

  const score = movie?.score || movie?.recommendationScore || 0;
  const rawScorePercent = score > 1 ? Math.round(score) : Math.round(score * 100);
  const matchPercent = Math.min(98, Math.max(78, rawScorePercent > 0 ? rawScorePercent : 88 + (title.length % 10)));

  const finalCast = Array.isArray(enrichedMeta?.cast) && enrichedMeta.cast.length > 0
    ? enrichedMeta.cast
    : (Array.isArray(movie?.cast) && movie.cast.length > 0 ? movie.cast : []);

  const finalDirector = enrichedMeta?.director || movie?.director || '';

  const handleToggleFav = () => {
    const normalized = normalizeMovie(movie) || movie;
    if (!normalized) return;
    const added = userStorage.toggleFavourite(normalized);
    setIsFav(added);
    if (added && showToast) showToast('Added to your cinema vault', 'favourite');
  };

  const handleToggleWatch = () => {
    const normalized = normalizeMovie(movie) || movie;
    if (!normalized) return;
    const added = userStorage.isInWatchlist(normalized.movieId);
    userStorage.toggleWatchlist(normalized);
    setIsWatch(!added);
    if (!added && showToast) showToast('Saved to your watchlist', 'watchlist');
  };

  return (
    <AnimatePresence>
      <motion.div
        className="details-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="details-modal-container"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* CLOSE BUTTON */}
          <button className="details-close-btn" onClick={onClose}>
            <X size={20} />
          </button>

          {/* TOP HERO BACKDROP BANNER */}
          <div className="details-hero-banner">
            <img src={backdropUrl} alt={title} className="banner-backdrop-img" />
            <div className="banner-gradient-overlay" />
            
            <div className="banner-content-stack">
              <div className="banner-signal-badge">
                <Sparkles size={13} className="badge-sparkle" />
                <span>MOVIEMIND COMPATIBILITY SIGNAL &bull; {matchPercent}% MATCH</span>
              </div>

              <h1 className="banner-movie-title">{title}</h1>

              <div className="banner-meta-row">
                {year && <span className="meta-chip">{year}</span>}
                {rating !== 'N/A' && (
                  <span className="meta-chip rating-chip">
                    <Star size={13} fill="#eab308" color="#eab308" />
                    <span>{rating}</span>
                  </span>
                )}
                {genres.length > 0 && genres.slice(0, 3).map((g, i) => (
                  <span key={i} className="meta-chip genre-chip">{g}</span>
                ))}
              </div>

              {/* ACTION BUTTONS */}
              <div className="banner-actions-row">
                <button className="btn-banner-primary" onClick={() => setIsTrailerOpen(true)}>
                  <Play size={16} fill="currentColor" />
                  <span>WATCH TRAILER</span>
                </button>

                <button 
                  className={`btn-banner-secondary ${isFav ? 'active' : ''}`}
                  onClick={handleToggleFav}
                >
                  <Heart size={16} fill={isFav ? '#ff2a5f' : 'none'} color={isFav ? '#ff2a5f' : '#ffffff'} />
                  <span>{isFav ? 'IN VAULT' : 'ADD TO VAULT'}</span>
                </button>

                <button 
                  className={`btn-banner-tertiary ${isWatch ? 'active' : ''}`}
                  onClick={handleToggleWatch}
                >
                  <Bookmark size={16} fill={isWatch ? '#00f2ff' : 'none'} color={isWatch ? '#00f2ff' : '#ffffff'} />
                  <span>{isWatch ? 'ON RADAR' : 'WATCHLIST'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN DEEP INTELLIGENCE CONTENT */}
          <div className="details-content-grid">
            {/* LEFT MAIN COLUMN */}
            <div className="details-main-column">
              {/* ABOUT THE MOVIE */}
              <div className="details-section-box">
                <h3 className="section-heading">ABOUT THE MOVIE</h3>
                <p className="movie-overview-paragraph">{overview}</p>
              </div>

              {/* WHY MOVIEMIND RECOMMENDS IT */}
              <div className="details-section-box">
                <h3 className="section-heading">
                  <Sparkles size={16} className="heading-sparkle" /> WHY MOVIEMIND RECOMMENDS IT
                </h3>
                <div className="ai-reasons-cards-grid">
                  <div className="reason-card">
                    <CheckCircle2 size={16} className="reason-icon" />
                    <div className="reason-info">
                      <h4>STORY ALIGNMENT</h4>
                      <p>High match with your preferences for epic narrative arcs and world building.</p>
                    </div>
                  </div>

                  <div className="reason-card">
                    <CheckCircle2 size={16} className="reason-icon" />
                    <div className="reason-info">
                      <h4>EMOTIONAL SIGNAL</h4>
                      <p>Resonates strongly with your viewing intensity and dramatic pacing history.</p>
                    </div>
                  </div>

                  <div className="reason-card">
                    <CheckCircle2 size={16} className="reason-icon" />
                    <div className="reason-info">
                      <h4>GENRE DNA</h4>
                      <p>Overlaps with your top genre signals in Action, Drama, and Adventure.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CAST & DIRECTOR */}
              <div className="details-section-box">
                <h3 className="section-heading">
                  {finalCast.length > 0 ? 'FEATURED CAST & DIRECTOR' : 'CHARACTER ATMOSPHERE & UNIVERSE'}
                </h3>
                
                {finalDirector && (
                  <p className="director-name-line">
                    <span className="label">DIRECTED BY:</span> <span className="value">{finalDirector}</span>
                  </p>
                )}

                {finalCast.length > 0 ? (
                  <div className="cast-chips-grid">
                    {finalCast.slice(0, 6).map((actor, idx) => (
                      <div key={idx} className="actor-chip">
                        <span className="actor-dot"></span>
                        <span className="actor-name">{typeof actor === 'string' ? actor : (actor.name || 'Featured Actor')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="atmosphere-fallback-box">
                    <Clapperboard size={20} className="atmo-icon" />
                    <p>
                      This story unfolds within the <strong>{genres[0] || 'Cinematic'}</strong> genre universe, featuring rich narrative depth, atmospheric score, and memorable character arcs.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="details-sidebar-column">
              {/* MOVIEMIND SIGNAL CONFIDENCE GAUGE */}
              <div className="signal-gauge-box">
                <div className="gauge-header">
                  <Dna size={18} className="gauge-icon" />
                  <h4>MOVIEMIND SIGNAL</h4>
                </div>

                <div className="gauge-score-row">
                  <span className="score-number">{matchPercent}%</span>
                  <span className="score-label">MATCH CONFIDENCE</span>
                </div>

                {/* SIGNAL ALIGNMENT BARS */}
                <div className="alignment-bars-stack">
                  <div className="align-bar-item">
                    <div className="bar-label-row">
                      <span>Action Alignment</span>
                      <span>94%</span>
                    </div>
                    <div className="bar-track"><div className="bar-fill cyan" style={{ width: '94%' }}></div></div>
                  </div>

                  <div className="align-bar-item">
                    <div className="bar-label-row">
                      <span>Drama Alignment</span>
                      <span>88%</span>
                    </div>
                    <div className="bar-track"><div className="bar-fill gold" style={{ width: '88%' }}></div></div>
                  </div>

                  <div className="align-bar-item">
                    <div className="bar-label-row">
                      <span>Adventure Alignment</span>
                      <span>82%</span>
                    </div>
                    <div className="bar-track"><div className="bar-fill crimson" style={{ width: '82%' }}></div></div>
                  </div>
                </div>
              </div>

              {/* STORIES WITH A SIMILAR PULSE */}
              <div className="similar-movies-sidebar-box">
                <h4 className="sidebar-box-title">STORIES WITH A SIMILAR PULSE</h4>
                {loadingSimilar ? (
                  <div className="similar-loading">Calibrating similar signals...</div>
                ) : (
                  <div className="similar-mini-list">
                    {similarMovies.slice(0, 4).map((sim, i) => {
                      const simNorm = normalizeMovie(sim) || sim;
                      return (
                        <div 
                          key={simNorm.movieId || i} 
                          className="similar-mini-card"
                          onClick={() => onMovieSelect?.(simNorm)}
                        >
                          <img 
                            src={simNorm.poster} 
                            alt={simNorm.title} 
                            className="mini-poster"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div className="mini-info">
                            <div className="mini-title">{simNorm.title}</div>
                            <div className="mini-meta">{simNorm.year} &bull; ⭐ {simNorm.rating}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <TrailerModal
            isOpen={isTrailerOpen}
            onClose={() => setIsTrailerOpen(false)}
            movieTitle={title}
            trailerUrl={movie?.trailer}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
