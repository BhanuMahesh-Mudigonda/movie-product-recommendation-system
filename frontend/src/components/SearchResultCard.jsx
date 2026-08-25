import React, { useState } from 'react';
import { Star, Calendar, ChevronRight, Globe, Sparkles, Film, Play } from 'lucide-react';
import { safeString, safeGenres } from '../utils/movieUtils';
import './SearchResultCard.css';

export default function SearchResultCard({ movie, onMovieSelect, onWatchTrailer }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const movieData = movie || {};
  const { title, genres, poster, rating, year, language, isExternal, trailer } = movieData;
  const hasTrailer = trailer?.status !== 'not_found' && trailer?.url;

  return (
    <div className={`search-result-card ${isExternal ? 'external-card' : ''}`}>
      {/* TOP: POSTER */}
      <div className="src-poster-wrapper">
        {!imgLoaded && !imgError && (
          <div className="src-poster-skeleton"></div>
        )}
        
        {poster && !imgError ? (
          <img 
            src={poster} 
            alt={title || 'Movie'} 
            className={`src-poster-image ${imgLoaded ? 'loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="src-poster-fallback">
            <Film size={48} opacity={0.3} />
            <span className="fallback-text">Cinema Archive</span>
          </div>
        )}
      </div>

      {/* BOTTOM: METADATA */}
      <div className="src-content">
        <div className="src-header">
          <h3>{safeString(title, 'Unknown Movie')}</h3>
          {!isExternal && (
            <span className="src-ai-badge">
              <Sparkles size={12} /> AI Ready
            </span>
          )}
        </div>

        <div className="src-meta-row">
          {rating && rating !== 'N/A' && (
            <span className="src-meta-item">
              <Star size={14} fill="currentColor" className="text-gold" />
              {safeString(rating)}
            </span>
          )}
          {year && (
            <span className="src-meta-item">
              <Calendar size={14} />
              {safeString(year)}
            </span>
          )}
          {language && (
            <span className="src-meta-item">
              <Globe size={14} />
              {safeString(language)}
            </span>
          )}
        </div>

        <p className="src-genres">{safeGenres(genres)}</p>

        <div className="src-actions">
          {hasTrailer ? (
            <button 
              className="src-btn-trailer" 
              onClick={(e) => {
                e.stopPropagation();
                if (trailer?.embedUrl) {
                  onWatchTrailer?.(trailer.url);
                } else if (trailer?.url) {
                  window.open(trailer.url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <Play size={14} fill="currentColor" />
              Watch Trailer
            </button>
          ) : (
            <button className="src-btn-trailer disabled" disabled>
              Trailer Not Found
            </button>
          )}

          <button 
            className="src-btn-explore" 
            onClick={() => onMovieSelect?.(movieData)}
          >
            Explore <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
