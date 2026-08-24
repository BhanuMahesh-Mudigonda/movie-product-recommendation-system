import React, { useEffect, useState, useCallback } from 'react';
import { Search, Film } from 'lucide-react';
import { movieSearchService } from '../services/MovieSearchService';
import SearchResultCard from '../components/SearchResultCard';
import TrailerModal from '../components/TrailerModal';
import './SearchPage.css';

const searchCache = new Map();

export default function SearchPage({ initialQuery = '', onMovieSelect }) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Trailer Modal State
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState(null);

  const openTrailer = (url) => {
    setCurrentTrailerUrl(url);
    setIsTrailerOpen(true);
  };

  const closeTrailer = () => {
    setIsTrailerOpen(false);
    setCurrentTrailerUrl(null);
  };

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const searchMovies = useCallback(async (searchText) => {
    const cleanQuery = String(searchText || '').trim();

    if (!cleanQuery) {
      setMovies([]);
      setHasSearched(false);
      return;
    }

    if (searchCache.has(cleanQuery)) {
      setMovies(searchCache.get(cleanQuery));
      setHasSearched(true);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      
      const results = await movieSearchService.search(cleanQuery);
      setMovies(results);
      searchCache.set(cleanQuery, results);

    } catch (error) {
      console.error('MovieMind search error:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cleanQuery = String(debouncedQuery || '').trim();
    if (cleanQuery) {
      searchMovies(cleanQuery);
    } else {
      setMovies([]);
      setHasSearched(false);
    }
  }, [debouncedQuery, searchMovies]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (query.trim() !== debouncedQuery.trim()) {
      setDebouncedQuery(query); // instantly trigger if they hit enter
    }
  };

  const getTitle = (movie) => movie?.title || movie?.Title || 'Unknown Movie';
  const getGenres = (movie) => movie?.genres || movie?.genre || movie?.Genre || 'Movie';
  const getPoster = (movie) => movie?.poster || movie?.Poster || null;
  const getRating = (movie) => movie?.rating || movie?.imdbRating || movie?.avg_rating || null;
  const getYear = (movie) => movie?.year || movie?.Year || '';

  const renderSkeleton = () => (
    <div className="dataset-movie-grid">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <div key={n} className="dataset-movie-item skeleton-item">
          <div className="skeleton-number"></div>
          <div className="skeleton-poster"></div>
          <div className="skeleton-info">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line meta"></div>
            <div className="skeleton-line desc"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="dataset-search-page">
      <div className="dataset-search-hero">
        <span className="dataset-search-label">UNIVERSAL SEARCH</span>
        <h1>Search Movies</h1>
        <p>Explore any movie from across the world.</p>
      </div>

      <form className="dataset-search-box" onSubmit={handleSubmit}>
        <Search size={21} />
        <input
          type="text"
          placeholder="Search global cinema..."
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && hasSearched && (
        <section className="dataset-movie-results">
          <div className="results-section">
            <div className="results-title">
              <div>
                <h2>Searching universe...</h2>
              </div>
            </div>
            {renderSkeleton()}
          </div>
        </section>
      )}

      {!loading && hasSearched && (
        <section className="dataset-movie-results">
          
          {movies.length > 0 ? (
            <div className="results-section">
              <div className="results-title">
                <div>
                  <span className="results-label internal-label">Found across the MovieMind universe.</span>
                  <h2>SEARCH RESULTS</h2>
                </div>
                <span className="movie-count">{movies.length} movies</span>
              </div>
              <div className="dataset-movie-grid new-search-grid">
                {movies.map((movie, index) => (
                  <SearchResultCard 
                    key={`${movie?.movieId || movie?.id || movie?.imdbID || movie?.title || index}`}
                    movie={movie}
                    onMovieSelect={onMovieSelect}
                    onWatchTrailer={openTrailer}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="dataset-empty">
              <Film size={35} />
              <h3>No movies found</h3>
              <p>Try another movie name or keyword.</p>
            </div>
          )}
        </section>
      )}

      <TrailerModal 
        isOpen={isTrailerOpen} 
        trailerUrl={currentTrailerUrl} 
        onClose={closeTrailer} 
      />
    </div>
  );
}
