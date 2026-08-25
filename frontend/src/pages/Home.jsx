import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { movieMindRanker } from '../services/movieMindRanker';
import { movieEnrichmentService } from '../services/movieEnrichmentService';
import Hero from '../components/Hero';
import MovieCarousel from '../components/MovieCarousel';
import MovieCard from '../components/MovieCard';
import BackButton from '../components/BackButton';
import { normalizeMovie } from '../utils/movieUtils';
import './Home.css';

// Module-level in-memory cache to prevent re-fetching catalogue on tab switches
let cachedHomeCatalogue = null;
let cachedRecommendations = null;
let cachedTeluguRow = null;

function hasValidPoster(movie) {
  if (!movie) return false;
  const p = movie.poster || movie.Poster || movie.poster_url || movie.posterUrl || movie.image;
  if (!p) return false;
  const str = String(p).trim().toLowerCase();
  if (str === '' || str === 'n/a' || str === 'null' || str === 'undefined' || str === 'none') return false;
  return true;
}

export default function Home({
  searchQuery,
  onMovieSelect,
  categoryFilter,
  onBack
}) {
  const [catalogueData, setCatalogueData] = useState(cachedHomeCatalogue);
  const [recommended, setRecommended] = useState(cachedRecommendations || []);
  const [teluguRow, setTeluguRow] = useState(cachedTeluguRow || []);
  const [loadingRecs, setLoadingRecs] = useState(!cachedRecommendations);
  const [loadingCatalogue, setLoadingCatalogue] = useState(!cachedHomeCatalogue);

  // =====================================================
  // LOAD MOVIEMIND HOME CATALOGUE
  // =====================================================

  useEffect(() => {
    const loadCatalogue = async () => {
      if (cachedHomeCatalogue) {
        setCatalogueData(cachedHomeCatalogue);
        setLoadingCatalogue(false);
        return;
      }

      setLoadingCatalogue(true);

      try {
        const data = await api.getHomeMovies();
        if (data) {
          cachedHomeCatalogue = data;
          setCatalogueData(data);
        }
      } catch (error) {
        console.error('Home catalogue loading failed:', error);
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
      if (cachedRecommendations) {
        setRecommended(cachedRecommendations);
        setLoadingRecs(false);
        return;
      }

      setLoadingRecs(true);

      try {
        const data = await api.getRecommendations(1, 11);
        const originalRecommendations = data?.recommendations || [];
        const rankedRecommendations = movieMindRanker.rankMovies(originalRecommendations);
        const enrichedRecommendations = await movieEnrichmentService.enrichMovies(rankedRecommendations);
        const validRecs = (enrichedRecommendations || []).filter(hasValidPoster);

        cachedRecommendations = validRecs;
        setRecommended(validRecs);
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
  // BUILD DEDICATED TELUGU ROW (Salaar #1, Kalki #2, Hi Nanna, Sita Ramam, Shyam Singha Roy...)
  // =====================================================

  useEffect(() => {
    const fetchTeluguRow = async () => {
      if (cachedTeluguRow && cachedTeluguRow.length >= 8) {
        setTeluguRow(cachedTeluguRow);
        return;
      }

      const teluguQueries = [
        "Salaar",
        "Kalki",
        "Hi Nanna",
        "Sita Ramam",
        "Shyam Singha Roy",
        "RRR",
        "Baahubali",
        "Pushpa",
        "Jersey",
        "Rangasthalam",
        "Dhamaka",
        "Waltair Veerayya"
      ];

      try {
        const row = [];
        const usedKeys = new Set();

        const promises = teluguQueries.map(q => api.searchMovies(q, 1));
        const resList = await Promise.all(promises);

        for (const res of resList) {
          if (Array.isArray(res) && res.length > 0) {
            const norm = normalizeMovie(res[0]);
            if (norm && hasValidPoster(norm)) {
              const title = String(norm.title || '').toLowerCase();
              if (title.includes('forever')) continue; // Exclude invalid titles

              const key = String(norm.movieId || norm.id || title).toLowerCase();
              if (!usedKeys.has(key)) {
                row.push(norm);
                usedKeys.add(key);
              }
            }
          }
        }

        // Add extra valid Telugu movies from catalogue data
        const pool = [
          ...(catalogueData?.hero || []),
          ...(catalogueData?.trending || []),
          ...(catalogueData?.action || []),
          ...(catalogueData?.hidden_gems || [])
        ];

        for (const m of pool) {
          if (!m || !hasValidPoster(m)) continue;
          const norm = normalizeMovie(m) || m;
          const title = String(norm.title || '').toLowerCase();
          const lang = String(norm.language || norm.languageCode || '').toLowerCase();
          const key = String(norm.movieId || norm.id || title).toLowerCase();

          if (usedKeys.has(key) || title.includes('forever')) continue;

          const isTelugu = lang.includes('telugu') || [
            'baahubali', 'pushpa', 'rrr', 'rangasthalam', 'eega', 
            'aravindha', 'bharath', 'jersey', 'kancharapalem', 'bommarillu', 'race gurram'
          ].some(t => title.includes(t));

          if (isTelugu) {
            row.push(norm);
            usedKeys.add(key);
          }
        }

        if (row.length > 0) {
          cachedTeluguRow = row;
          setTeluguRow(row);
        }
      } catch (err) {
        console.error("Failed to build Telugu row:", err);
      }
    };

    fetchTeluguRow();
  }, [catalogueData]);

  // =====================================================
  // UNIVERSAL MOVIE SEARCH
  // 1. Smart MovieMind catalogue search
  // 2. Enriched metadata when available
  // 3. Existing dataset search fallback
  // =====================================================

  // =====================================================
  // SEARCH PAGE (Logic removed as it's now handled by SearchPage.jsx)
  // =====================================================



  // =====================================================
  // CATEGORY PAGE
  // =====================================================

  if (categoryFilter) {

    const categoryConfig = {
      trending: {
        key: 'trending',
        title: '🔥 Trending Now'
      },

      'new-releases': {
        key: 'new_releases',
        title: '🆕 New Releases'
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

          {onBack && <BackButton onBack={onBack} />}

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
      key: 'telugu',
      title: '🔥 Top Telugu Blockbusters',
      movies: teluguRow.filter(hasValidPoster)
    },

    {
      key: 'recommended',
      title: '🤖 Recommended For You',
      movies: (catalogueData?.recommended || []).filter(hasValidPoster)
    },

    {
      key: 'trending',
      title: '🔥 Trending Now',
      movies: (catalogueData?.trending || []).filter(hasValidPoster)
    },

    {
      key: 'top_rated',
      title: '⭐ Top Rated',
      movies: (catalogueData?.top_rated || []).filter(hasValidPoster)
    },

    {
      key: 'blockbusters',
      title: '💥 Blockbusters',
      movies: (catalogueData?.blockbusters || []).filter(hasValidPoster)
    },

    {
      key: 'action',
      title: '🔥 Action & Thriller',
      movies: (catalogueData?.action || []).filter(hasValidPoster)
    },

    {
      key: 'romance',
      title: '❤️ Romance',
      movies: (catalogueData?.romance || []).filter(hasValidPoster)
    },

    {
      key: 'drama',
      title: '🎭 Drama',
      movies: (catalogueData?.drama || []).filter(hasValidPoster)
    },

    {
      key: 'crime',
      title: '🔎 Crime & Mystery',
      movies: (catalogueData?.crime || []).filter(hasValidPoster)
    },

    {
      key: 'comedy',
      title: '😂 Comedy',
      movies: (catalogueData?.comedy || []).filter(hasValidPoster)
    },

    {
      key: 'family',
      title: '👨‍👩‍👧 Family Entertainment',
      movies: (catalogueData?.family || []).filter(hasValidPoster)
    },

    {
      key: 'award_winning',
      title: '🏆 Award Winning',
      movies: (catalogueData?.award_winning || []).filter(hasValidPoster)
    },

    {
      key: 'hidden_gems',
      title: '💎 Hidden Gems',
      movies: (catalogueData?.hidden_gems || []).filter(hasValidPoster)
    }

  ];

  return (
    <div className="home-page">

      {/* HERO / SKELETON */}
      {catalogueData?.hero?.length > 0 ? (
        <Hero
          movies={catalogueData.hero}
          onMovieSelect={onMovieSelect}
        />
      ) : loadingCatalogue ? (
        <div className="hero-skeleton-loader" style={{
          height: '480px', width: '100%', borderRadius: '24px',
          background: 'linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%)',
          backgroundSize: '200% 100%', animation: 'skeletonShimmer 1.8s infinite',
          marginBottom: '32px'
        }} />
      ) : null}

      <div className="home-sections">

        {/* PERSONALIZED RECOMMENDATIONS */}
        {loadingRecs && !recommended.length ? (
          <div className="carousel-skeleton-loader" style={{ padding: '20px 0' }}>
            <div style={{ height: '24px', width: '220px', background: '#1e293b', borderRadius: '6px', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} style={{ width: '180px', height: '270px', borderRadius: '12px', background: '#1e293b', flexShrink: 0 }} />
              ))}
            </div>
          </div>
        ) : (
          recommended.length > 0 && (
            <MovieCarousel
              title="⚡ Your Cinematic Signal"
              movies={recommended}
              onMovieClick={onMovieSelect}
            />
          )
        )}

        {/* DATASET CATEGORIES */}
        {categories.map((category) => {
          const movies = category.movies || [];
          if (!movies.length) return null;

          return (
            <MovieCarousel
              key={category.key}
              title={category.title}
              movies={movies}
              onMovieClick={onMovieSelect}
            />
          );
        })}

        {/* LOADING CATALOGUE SKELETON */}
        {loadingCatalogue && !catalogueData && (
          <div className="carousel-skeleton-loader">
            <div style={{ height: '24px', width: '200px', background: '#1e293b', borderRadius: '6px', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} style={{ width: '180px', height: '270px', borderRadius: '12px', background: '#1e293b', flexShrink: 0 }} />
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
