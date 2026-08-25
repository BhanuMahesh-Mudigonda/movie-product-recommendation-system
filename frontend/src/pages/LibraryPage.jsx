import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Dna, Compass, Flame } from 'lucide-react';
import { userStorage } from '../services/userStorage';
import MovieCard from '../components/MovieCard';
import BackButton from '../components/BackButton';
import './LibraryPage.css';

export default function LibraryPage({ type, onMovieSelect, onBack }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    loadMovies();
  }, [type]);

  const loadMovies = () => {
    switch (type) {
      case 'favourites':
        setMovies(userStorage.getFavourites());
        break;
      case 'watchlist':
        setMovies(userStorage.getWatchlist());
        break;
      case 'history':
        setMovies(userStorage.getHistory());
        break;
      case 'insights':
        setMovies(userStorage.getFavourites());
        break;
      default:
        setMovies([]);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'favourites': return 'YOUR CINEMATIC VAULT';
      case 'watchlist': return 'STORIES ON YOUR RADAR';
      case 'history': return 'YOUR CINEMATIC TRAIL';
      case 'insights': return 'YOUR CINEMATIC DNA';
      default: return 'Library';
    }
  };

  const getEmptyMessage = () => {
    switch (type) {
      case 'favourites': return 'YOUR CINEMATIC VAULT IS WAITING.';
      case 'watchlist': return 'NO STORIES ON YOUR RADAR YET.';
      case 'history': return 'YOUR CINEMATIC TRAIL IS BLANK.';
      case 'insights': return 'EXPLORE MOVIES TO GENERATE YOUR CINEMATIC DNA.';
      default: return 'No movies found.';
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your watch history?")) {
      userStorage.clearHistory();
      loadMovies();
    }
  };

  return (
    <div className="library-page">
      {onBack && <BackButton onBack={onBack} />}
      
      {/* YOUR CINEMATIC DNA PROFILE HEADER */}
      <div className="dna-profile-card">
        <div className="dna-badge">
          <Dna size={18} className="dna-icon" />
          <span>YOUR CINEMATIC DNA</span>
        </div>
        <h2 className="dna-profile-title">THE EPIC STORY SEEKER</h2>
        <div className="dna-pills-row">
          <span className="dna-pill action">ACTION &bull; 94%</span>
          <span className="dna-pill drama">DRAMA &bull; 88%</span>
          <span className="dna-pill adventure">ADVENTURE &bull; 82%</span>
        </div>
      </div>

      <div className="library-header">
        <h1 className="library-title">{getTitle()}</h1>
        {type === 'history' && movies.length > 0 && (
          <button className="clear-history-btn" onClick={clearHistory}>
            CLEAR TRAIL
          </button>
        )}
      </div>

      {movies.length === 0 ? (
        <div className="library-empty">
          <p>{getEmptyMessage()}</p>
        </div>
      ) : (
        <div className="movie-grid">
          {movies.map((movie, idx) => (
            <MovieCard
              key={movie.movieId || movie.id || idx}
              movie={movie}
              onClick={onMovieSelect}
              rank={idx + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
