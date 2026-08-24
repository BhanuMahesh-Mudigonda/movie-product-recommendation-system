import React, { useEffect, useMemo, useState } from 'react';
import { X, PlayCircle, Star, Sparkles, Clock, Globe, UserRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import FallbackPoster from './FallbackPoster';
import './MovieDetailsModal.css';

export default function MovieDetailsModal({ movie, onClose }) {
  const [details, setDetails] = useState(movie);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    setDetails(movie);
    setSimilarMovies([]);

    if (!movie) return;

    if (movie.movieId) {
      setLoadingSimilar(true);

      api.getSimilarMovies(movie.movieId)
        .then(data => {
          setSimilarMovies(data?.recommendations || []);
        })
        .catch(err => console.error('Similar movies error:', err))
        .finally(() => setLoadingSimilar(false));
    }
  }, [movie]);

  if (!movie) return null;

  const title = details.title || details.Title || 'Unknown Movie';
  const year = details.year || details.Year || '';
  const poster = details.poster || details.Poster;

  const genreText = details.genre || details.genres || details.Genre || '';

  const genres = Array.isArray(genreText)
    ? genreText
    : genreText
        .replace(/\|/g, ',')
        .split(',')
        .map(g => g.trim())
        .filter(Boolean);

  const rating =
    details.imdbRating ||
    details.rating;

  const director = details.director || details.Director;
  const actors = details.cast || details.actors || details.Actors;
  const runtime = details.runtime || details.Runtime;
  const language = details.language || details.Language;
  const country = details.country || details.Country;
  const plot = details.plot || details.Plot;
  const trailer = details.trailer;
  const whereToWatch = details.whereToWatch || [];

  const recommendationScore =
    typeof details.recommendationScore === 'number' 
      ? details.recommendationScore 
      : typeof details.score === 'number' ? details.score : null;

  const reason =
    details.recommendationReason ||
    details.reason ||
    'MovieMind selected this movie using its recommendation and discovery system.';

  const trailerSearchUrl = useMemo(() => {
    const query = encodeURIComponent(`${title} ${year} official trailer`);
    return trailer || `https://www.youtube.com/results?search_query=${query}`;
  }, [title, year, trailer]);

  const openTrailer = () => {
    if (trailer) {
      window.open(trailer, '_blank', 'noopener,noreferrer');
    } else {
      window.open(trailerSearchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="modal-content glass-panel"
          initial={{ opacity: 0, scale: 0.92, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 25 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>

          <div className="modal-layout">

            <div className="modal-poster-section">
              <div className="modal-poster">
                {poster && poster !== 'N/A' ? (
                  <img
                    src={poster}
                    alt={title}
                    className="modal-real-poster"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <FallbackPoster
                    title={title}
                    genres={genres.join('|')}
                  />
                )}
              </div>
            </div>

            <div className="modal-info-section">

              <h2 className="modal-title">{title}</h2>

              {year && (
                <span className="modal-year">{year}</span>
              )}

              {genres.length > 0 && (
                <div className="modal-meta">
                  {genres.map(g => (
                    <span key={g} className="modal-genre">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {rating && rating !== 'N/A' && (
                <div className="modal-score-box">
                  <span className="score-label">IMDb Rating</span>
                  <span className="score-value">
                    ⭐ {rating} / 10
                  </span>
                </div>
              )}

              {loadingDetails && (
                <div className="details-loading">
                  Loading movie intelligence...
                </div>
              )}

              <div className="movie-info-grid">

                {director && director !== 'N/A' && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Director</span>
                    <strong className="movie-info-value">{director}</strong>
                  </div>
                )}

                {actors && actors !== 'N/A' && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Cast</span>
                    <strong className="movie-info-value">{actors}</strong>
                  </div>
                )}

                {runtime && runtime !== 'N/A' && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Runtime</span>
                    <strong className="movie-info-value">{runtime}</strong>
                  </div>
                )}

                {language && language !== 'N/A' && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Language</span>
                    <strong className="movie-info-value">{language}</strong>
                  </div>
                )}

                {country && country !== 'N/A' && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Country</span>
                    <strong className="movie-info-value">{country}</strong>
                  </div>
                )}

              </div>

              {plot && plot !== 'N/A' && (
                <div className="movie-story">
                  <h3 className="movie-section-label">Story</h3>
                  <p>{plot}</p>
                </div>
              )}

              <div className="why-recommended">
                <h4>✨ MovieMind AI</h4>

                {recommendationScore !== null && (
                  <div className="ai-score">
                    <strong>
                      {(recommendationScore * 100).toFixed(0)}% MATCH
                    </strong>
                  </div>
                )}

                <p>
                  <strong>Why recommended:</strong><br />
                  {reason}
                </p>
              </div>

              <div className="modal-actions">
                <div className="trailer-heading">🎬 Trailer</div>

                {trailer ? (
                  <button
                    className="btn-play"
                    onClick={openTrailer}
                  >
                    <PlayCircle size={20} />
                    Watch Trailer
                  </button>
                ) : (
                  <div className="unavailable-state">
                    Trailer unavailable
                  </div>
                )}
              </div>
              
              <div className="where-to-watch-section">
                <h3 className="movie-section-label">Where to Watch</h3>
                {whereToWatch && whereToWatch.length > 0 ? (
                  <div className="providers-list">
                    {whereToWatch.map(provider => (
                      <span key={provider.provider} className="provider-tag">
                        {provider.provider} ({provider.type})
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="unavailable-state">
                    Where to Watch information unavailable
                  </div>
                )}
              </div>

              {movie.movieId && (
                <div className="similar-section">
                  <h3>Similar Movies</h3>

                  {loadingSimilar ? (
                    <div className="loading-spinner"></div>
                  ) : similarMovies.length > 0 ? (
                    <div className="similar-track hide-scrollbar">
                      {similarMovies.map(sm => (
                        <div
                          key={sm.movieId}
                          className="similar-card"
                        >
                          <div className="similar-poster">
                            <FallbackPoster
                              title={sm.title}
                              genres={sm.genres}
                            />
                          </div>

                          <p title={sm.title}>
                            {sm.title}
                          </p>

                          {typeof sm.score === 'number' && (
                            <span>
                              Similarity: {sm.score.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-similar">
                      Similar movies will appear here.
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
