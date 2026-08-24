import React, { useState, useEffect } from 'react';
import { Star, Calendar, ChevronRight, Globe, Sparkles, Film, Play } from 'lucide-react';
import { movieSearchService } from '../services/MovieSearchService';
import './SearchResultCard.css';

export default function SearchResultCard({ movie, onMovieSelect, onWatchTrailer }) {
  const [movieData, setMovieData] = useState(movie);
  const [isEnriching, setIsEnriching] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkAndEnrich = async () => {
      // Re-evaluate if it has a valid poster
      const hasPoster = movieData.poster && movieData.poster !== 'N/A' && String(movieData.poster).startsWith('http');
      
      if (!movieData.isExternal && !hasPoster) {
        setIsEnriching(true);
        const enriched = await movieSearchService.enrichMovieMetadata(movieData);
        if (mounted) {
          setMovieData(enriched);
          setIsEnriching(false);
        }
      }
    };
    checkAndEnrich();
    return () => { mounted = false; };
  }, [movie]);

  const { title, genres, poster, rating, year, language, isExternal, trailer } = movieData;
  const hasTrailer = trailer?.status !== 'not_found' && trailer?.url;

  return (
    <div className={`search-result-card ${isExternal ? 'external-card' : ''}`}>
      {/* TOP: POSTER */}
      <div className="src-poster-wrapper">
        {(!imgLoaded || isEnriching) && !imgError && (
          <div className="src-poster-skeleton"></div>
        )}
        
        {poster && !imgError ? (
          <img 
            src={poster} 
            alt={title} 
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
          <h3>{title}</h3>
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
              {rating}
            </span>
          )}
          {year && (
            <span className="src-meta-item">
              <Calendar size={14} />
              {year}
            </span>
          )}
          {language && (
            <span className="src-meta-item">
              <Globe size={14} />
              {language}
            </span>
          )}
        </div>

        <p className="src-genres">{genres}</p>

        <div className="src-actions">
          {hasTrailer ? (
            <button 
              className="src-btn-trailer" 
              onClick={(e) => {
                e.stopPropagation();
                if (trailer.embedUrl) {
                  onWatchTrailer?.(trailer.url);
                } else {
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
