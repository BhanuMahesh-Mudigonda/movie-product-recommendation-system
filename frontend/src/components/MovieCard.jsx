import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Heart, Bookmark } from 'lucide-react';
import FallbackPoster from './FallbackPoster';
import { normalizeMovie } from '../utils/movieUtils';
import { userStorage } from '../services/userStorage';
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

  const showFallback = !poster || poster === 'N/A' || imageError;

  const handleToggleFav = (e) => {
    e.stopPropagation();
    if (!normalized) return;
    const added = userStorage.toggleFavourite(normalized);
    setIsFav(added);
    if (added && showToast) showToast('Added to your cinema shelf', 'favourite');
  };

  const handleToggleWatch = (e) => {
    e.stopPropagation();
    if (!normalized) return;
    const added = userStorage.toggleWatchlist(normalized);
    setIsWatch(added);
    if (added && showToast) showToast('Saved for your next watch', 'watchlist');
  };

  return (
    <motion.div
      className="movie-card"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      onClick={() => onClick(movie)}
    >
      <div className="card-poster">

        {rank && (
          <div className="card-rank">
            #{rank}
          </div>
        )}

        {showFallback ? (
          <div className="fallback-wrapper">
            <FallbackPoster title={title} genres={genres.join(', ')} />
          </div>
        ) : (
          <img
            src={poster}
            alt={title}
            className="movie-poster-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}

        {score > 0 && (
          <div className="ai-match-badge">
            <Sparkles size={12} />
            <span>{(Number(score) * 100).toFixed(0)}% Match</span>
          </div>
        )}

        <div className="card-overlay">
          <div className="overlay-actions">
            <button className={`action-btn ${isWatch ? 'active' : ''}`} onClick={handleToggleWatch} title="Watchlist">
              <Bookmark size={18} fill={isWatch ? 'currentColor' : 'none'} />
            </button>
            <button className={`action-btn ${isFav ? 'active' : ''}`} onClick={handleToggleFav} title="Favourite">
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="overlay-content">
            <span className="view-details-btn">
              View Details
            </span>
          </div>
        </div>

      </div>

      <div className="card-info">

        <h4
          className="card-title"
          title={title}
        >
          {title}
        </h4>

        <div className="card-meta">

          {year && (
            <span className="movie-year">
              {year}
            </span>
          )}

          <div className="card-genres">
            {genres.map((genre, index) => (
              <span
                key={`${genre}-${index}`}
                className="genre-tag"
              >
                {genre}
              </span>
            ))}
          </div>

          {rating && rating !== 'N/A' && (
            <div className="card-rating">
              <Star
                size={12}
                fill="currentColor"
              />
              <span>
                {rating}
              </span>
            </div>
          )}

          {score > 0 && (
            <div
              className="card-score"
              title="AI Recommendation Score"
            >
              <Sparkles
                size={12}
                className="score-icon"
              />
              <span>
                {Number(score).toFixed(2)}
              </span>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}