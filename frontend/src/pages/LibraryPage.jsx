import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userStorage } from '../services/userStorage';
import MovieCard from '../components/MovieCard';
import './LibraryPage.css';

export default function LibraryPage({ type, onMovieSelect }) {
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
      default:
        setMovies([]);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'favourites': return 'My Favourites';
      case 'watchlist': return 'My Watchlist';
      case 'history': return 'Recently Viewed';
      default: return 'Library';
    }
  };

  const getEmptyMessage = () => {
    switch (type) {
      case 'favourites': return 'You haven\'t added any movies to your favourites yet.';
      case 'watchlist': return 'Your watchlist is empty. Add movies to watch later!';
      case 'history': return 'You haven\'t viewed any movies recently.';
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
      <div className="library-header">
        <h1 className="library-title">{getTitle()}</h1>
        {type === 'history' && movies.length > 0 && (
          <button className="clear-history-btn" onClick={clearHistory}>
            Clear History
          </button>
        )}
      </div>

      {movies.length === 0 ? (
        <div className="empty-state">
          <p>{getEmptyMessage()}</p>
        </div>
      ) : (
        <div className="library-grid">
          {movies.map((movie, index) => (
            <motion.div 
              key={movie.movieId + '-' + index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <MovieCard 
                movie={movie} 
                onClick={() => onMovieSelect(movie)} 
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
