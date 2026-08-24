import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Hero from '../components/Hero';
import MovieCarousel from '../components/MovieCarousel';
import MovieCard from '../components/MovieCard';
import './Home.css';

export default function Home({
  searchQuery,
  onMovieSelect,
  categoryFilter
}) {
  const [catalogueData, setCatalogueData] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [datasetResults, setDatasetResults] = useState([]);

  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingCatalogue, setLoadingCatalogue] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // =====================================================
  // LOAD MOVIEMIND HOME CATALOGUE
  // =====================================================

  useEffect(() => {
    const loadCatalogue = async () => {
      setLoadingCatalogue(true);

      try {
        const data = await api.getHomeMovies();
        setCatalogueData(data);
      } catch (error) {
        console.error('Home catalogue loading failed:', error);
        setCatalogueData(null);
      } finally {
        setLoadingCatalogue(false);
      }
    };

    loadCatalogue();
  }, []);

  // =====================================================
  // LOAD PERSONALIZED AI RECOMMENDATIONS
  // =====================================================

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoadingRecs(true);

      try {
        const data = await api.getRecommendations(1, 11);
        setRecommended(data?.recommendations || []);
      } catch (error) {
        console.error('Recommendation loading failed:', error);
        setRecommended([]);
      } finally {
        setLoadingRecs(false);
      }
    };

    loadRecommendations();
  }, []);

  // =====================================================
  // UNIVERSAL MOVIE SEARCH
  // 1. Smart MovieMind catalogue search
  // 2. Enriched metadata when available
  // 3. Existing dataset search fallback
  // =====================================================

  useEffect(() => {
    if (!searchQuery?.trim()) {
      setDatasetResults([]);
      return;
    }

    let cancelled = false;

    const searchMovies = async () => {
      setLoadingSearch(true);

      try {

        // ---------------------------------------------
        // MOVIEMIND FEATURED CATALOGUE SEARCH
        // ---------------------------------------------

        const results = await api.searchMovies(
          searchQuery,
          30
        );

        if (!cancelled) {
          setDatasetResults(
            Array.isArray(results)
              ? results
              : []
          );
        }

      } catch (error) {

        console.error(
          'Universal movie search failed:',
          error
        );

        if (!cancelled) {
          setDatasetResults([]);
        }

      } finally {

        if (!cancelled) {
          setLoadingSearch(false);
        }

      }
    };

    searchMovies();

    return () => {
      cancelled = true;
    };

  }, [searchQuery]);

  // =====================================================
  // SEARCH PAGE
  // =====================================================

  if (searchQuery?.trim()) {
    return (
      <div className="home-page">

        <div className="search-results-section">

          <div className="search-source-header">
            <div>
              <span className="source-label dataset-label">
                MOVIEMIND AI SEARCH
              </span>

              <h2>
                Search Results for "{searchQuery}"
              </h2>

              <p>
                Explore movies from the MovieMind recommendation dataset.
              </p>
            </div>

            {!loadingSearch && (
              <span className="result-count">
                {datasetResults.length} movies
              </span>
            )}
          </div>

          {loadingSearch ? (

            <div className="loading-spinner"></div>

          ) : datasetResults.length > 0 ? (

            <div className="search-grid">
              {datasetResults.map((movie, index) => (
                <MovieCard
                  key={
                    movie.movieId ||
                    movie.imdbID ||
                    `${movie.title}-${index}`
                  }
                  movie={movie}
                  onClick={() => onMovieSelect(movie)}
                />
              ))}
            </div>

          ) : (

            <div className="no-results">
              <h3>No movies found</h3>
              <p>
                Try searching with another movie title.
              </p>
            </div>

          )}

        </div>

      </div>
    );
  }

  // =====================================================
  // CATEGORY PAGE
  // =====================================================

  if (categoryFilter) {

    const categoryConfig = {
      trending: {
        key: 'trending',
        title: '🔥 Trending Now'
      },

      'top-rated': {
        key: 'top_rated',
        title: '⭐ Top Rated Movies'
      }
    };

    const config =
      categoryConfig[categoryFilter];

    const movies =
      config && catalogueData
        ? catalogueData[config.key] || []
        : [];

    return (
      <div className="home-page">

        <div className="category-page">

          <div className="category-page-header">
            <span className="source-label">
              MOVIEMIND COLLECTION
            </span>

            <h2 className="category-page-title">
              {config?.title || 'Movies'}
            </h2>

            <p>
              Explore curated movies from MovieMind.
            </p>
          </div>

          <div className="search-grid">

            {movies.map((movie, index) => (
              <MovieCard
                key={
                  movie.movieId ||
                  movie.imdbID ||
                  `${movie.title}-${index}`
                }
                movie={movie}
                onClick={() => onMovieSelect(movie)}
              />
            ))}

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // FINAL HOME CATEGORIES
  // =====================================================

  const categories = [

    {
      key: 'recommended',
      title: '🤖 Recommended For You'
    },

    {
      key: 'trending',
      title: '🔥 Trending Now'
    },

    {
      key: 'top_rated',
      title: '⭐ Top Rated'
    },

    {
      key: 'blockbusters',
      title: '💥 Blockbusters'
    },

    {
      key: 'action',
      title: '🔥 Action & Thriller'
    },

    {
      key: 'romance',
      title: '❤️ Romance'
    },

    {
      key: 'drama',
      title: '🎭 Drama'
    },

    {
      key: 'crime',
      title: '🔎 Crime & Mystery'
    },

    {
      key: 'comedy',
      title: '😂 Comedy'
    },

    {
      key: 'family',
      title: '👨‍👩‍👧 Family Entertainment'
    },

    {
      key: 'award_winning',
      title: '🏆 Award Winning'
    },

    {
      key: 'hidden_gems',
      title: '💎 Hidden Gems'
    }

  ];

  return (
    <div className="home-page">

      {/* HERO */}

      {catalogueData?.hero?.length > 0 && (
        <Hero
          movies={catalogueData.hero}
          onMovieSelect={onMovieSelect}
        />
      )}

      <div className="home-sections">

        {/* PERSONALIZED RECOMMENDATIONS */}

        {loadingRecs && !recommended.length ? (

          <div className="loading-spinner"></div>

        ) : (

          recommended.length > 0 && (
            <MovieCarousel
              title="🤖 Personalized AI Picks"
              movies={recommended}
              onMovieClick={onMovieSelect}
            />
          )

        )}

        {/* DATASET CATEGORIES */}

        {categories.map((category) => {

          const movies =
            catalogueData?.[category.key] || [];

          if (!movies.length) {
            return null;
          }

          return (
            <MovieCarousel
              key={category.key}
              title={category.title}
              movies={movies}
              onMovieClick={onMovieSelect}
            />
          );
        })}

        {/* LOADING */}

        {loadingCatalogue && !catalogueData && (
          <div className="loading-spinner"></div>
        )}

      </div>

    </div>
  );
}
