import React, { useState, useEffect, useLayoutEffect } from 'react';
import { api } from '../services/api';
import { movieMindRanker } from '../services/movieMindRanker';
import { movieEnrichmentService } from '../services/movieEnrichmentService';
import Hero from '../components/Hero';
import MovieCarousel from '../components/MovieCarousel';
import MovieCard from '../components/MovieCard';
import BackButton from '../components/BackButton';
import { normalizeMovie } from '../utils/movieUtils';
import { FALLBACK_CATALOGUE } from '../services/fallbackCatalogue';
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
  const [catalogueData, setCatalogueData] = useState(() => cachedHomeCatalogue || FALLBACK_CATALOGUE);
  const [recommended, setRecommended] = useState(() => cachedRecommendations || (FALLBACK_CATALOGUE.recommended || []));
  const [teluguRow, setTeluguRow] = useState(() => cachedTeluguRow || (FALLBACK_CATALOGUE.telugu || []));
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingCatalogue, setLoadingCatalogue] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [categoryFilter]);

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
        const originalRecommendations = data?.recommendations || (Array.isArray(data) ? data : []);
        const rankedRecommendations = movieMindRanker.rankMovies(originalRecommendations);
        const enrichedRecommendations = await movieEnrichmentService.enrichMovies(rankedRecommendations);
        const validRecs = (enrichedRecommendations || []).filter(hasValidPoster);

        // Merge with fallback catalogue pool to guarantee full carousel (prevent visual jumps)
        const fallbackList = (FALLBACK_CATALOGUE.recommended || []).filter(hasValidPoster);
        const existingKeys = new Set(validRecs.map(m => String(m.movieId || m.id || m.title).toLowerCase()));

        for (const fb of fallbackList) {
          const key = String(fb.movieId || fb.id || fb.title).toLowerCase();
          if (!existingKeys.has(key)) {
            validRecs.push(fb);
            existingKeys.add(key);
          }
        }

        cachedRecommendations = validRecs;
        setRecommended(validRecs);
      } catch (error) {
        console.error('Recommendation loading failed:', error);
        const fallback = (FALLBACK_CATALOGUE.recommended || []).filter(hasValidPoster);
        cachedRecommendations = fallback;
        setRecommended(fallback);
      } finally {
        setLoadingRecs(false);
      }
    };

    loadRecommendations();
  }, []);

  // =====================================================
  // DEDICATED TELUGU ROW INITIALIZATION
  // =====================================================
  if (!cachedTeluguRow) {
    cachedTeluguRow = (FALLBACK_CATALOGUE.telugu || []).filter(hasValidPoster);
  }

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

    const rawMovies =
      config && catalogueData
        ? (catalogueData[config.key] || [])
        : [];

    const movies = (rawMovies || []).filter(hasValidPoster);

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

          <div className="category-movie-grid">

            {movies.map((movie, index) => (
              <MovieCard
                key={
                  movie?.movieId ||
                  movie?.imdbID ||
                  movie?.id ||
                  `${movie?.title || 'movie'}-${index}`
                }
                movie={movie}
                onClick={() => onMovieSelect?.(movie)}
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
