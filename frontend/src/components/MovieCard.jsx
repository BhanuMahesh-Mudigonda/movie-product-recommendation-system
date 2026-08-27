import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Heart, Bookmark, Eye } from 'lucide-react';
import { normalizeMovie } from '../utils/movieUtils';
import { userStorage } from '../services/userStorage';
import { movieMindBrain } from '../services/movieMindBrain';
import { useToast } from './Toast';
import './MovieCard.css';

export default function MovieCard({ movie, onClick, rank }) {
  const [imageError, setImageError] = useState(false);
  const showToast = useToast();
  const normalized = normalizeMovie(movie) || movie;
  const [isFav, setIsFav] = useState(() => normalized ? userStorage.isFavourite(normalized.movieId) : false);
  const [isWatch, setIsWatch] = useState(() => normalized ? userStorage.isInWatchlist(normalized.movieId) : false);

  if (!movie) return null;

  const title = movie.title || movie.Title || movie.name || movie.original_title || 'Unknown Movie';
  const year = movie.year || movie.Year || movie.release_year || '';
  const poster = movie.poster || movie.Poster || movie.poster_url || movie.posterUrl || movie.image || null;
  const rating = movie.rating || movie.imdbRating || movie.vote_average || movie.avg_rating || null;
  
  const rawGenre = movie.genre || movie.genres || movie.Genre || '';
  const genres = Array.isArray(movie.genres) && movie.genres.length > 0 ? movie.genres : (rawGenre ? String(rawGenre).replace(/\|/g, ',').split(',').map(g => g.trim()).filter(Boolean) : []);
  
  const score = movie.score || movie.recommendationScore || 0;
  const rawScorePercent = score > 1 ? Math.round(score) : Math.round(score * 100);
  const matchPercent = Math.min(98, Math.max(78, rawScorePercent > 0 ? rawScorePercent : 85 + (title.length % 11)));

  const isInvalidPoster =
    !poster ||
    poster === 'N/A' ||
    poster === 'null' ||
    poster === 'undefined' ||
    poster === 'none';

  if (isInvalidPoster || imageError) {
    return null;
  }

  const handleToggleFav = (e) => {
    e.stopPropagation();
    if (!normalized) return;
    const added = userStorage.toggleFavourite(normalized);
    setIsFav(added);

    if (added) {
      movieMindBrain.trackFavourite(normalized);
    } else {
      movieMindBrain.removeFavourite(normalized);
    }
    if (added && showToast) showToast('Added to your cinema shelf', 'favourite');
  };

  const handleToggleWatch = (e) => {
    e.stopPropagation();
    if (!normalized) return;
    const added = userStorage.toggleWatchlist(normalized);
    setIsWatch(added);

    if (added) {
      movieMindBrain.trackWatchlist(normalized);
    }
    if (added && showToast) showToast('Saved for your next watch', 'watchlist');
  };

  const getGenreEnergyClass = (genreList) => {
    const listStr = (Array.isArray(genreList) ? genreList.join(' ') : String(genreList)).toLowerCase();
    if (listStr.includes('action') || listStr.includes('thriller')) return 'energy-fire';
    if (listStr.includes('history') || listStr.includes('drama')) return 'energy-gold';
    if (listStr.includes('sci-fi') || listStr.includes('fantasy')) return 'energy-cyan';
    return 'energy-crimson';
  };

  return (
    <motion.div 
      className={`movie-card-pro ${getGenreEnergyClass(genres)}`}
      onClick={() => onClick?.(normalized)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.25 }}
    >
      <div className="card-poster-wrapper">
        <img
          src={poster}
          alt={title}
          className="card-poster-img"
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* SIGNAL MATCH BADGE - CLAMPED GUARANTEED <= 100% */}
        <div className="card-signal-badge">
          <Sparkles size={11} className="badge-sparkle" />
          <span>{matchPercent}% MATCH</span>
        </div>

        {/* CARD HOVER OVERLAY */}
        <div className="card-hover-overlay">
          <div className="hover-action-row">
            <button 
              className={`hover-btn ${isFav ? 'active' : ''}`} 
              onClick={handleToggleFav}
              title="Add to Favourites"
            >
              <Heart size={16} fill={isFav ? '#ff2a5f' : 'none'} color={isFav ? '#ff2a5f' : '#ffffff'} />
            </button>
            <button 
              className={`hover-btn ${isWatch ? 'active' : ''}`} 
              onClick={handleToggleWatch}
              title="Add to Watchlist"
            >
              <Bookmark size={16} fill={isWatch ? '#00f2ff' : 'none'} color={isWatch ? '#00f2ff' : '#ffffff'} />
            </button>
          </div>

          <div className="hover-center-cta">
            <span className="cta-preview-btn">
              <Eye size={14} /> VIEW DETAILS
            </span>
          </div>
        </div>
      </div>

      <div className="card-info">
        <h4 className="card-title" title={title}>{title}</h4>
        <div className="card-meta">
          {year && <span className="card-year">{year}</span>}
          {rating && (
            <span className="card-rating">
              <Star size={12} fill="#eab308" color="#eab308" />
              <span>{rating}</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}