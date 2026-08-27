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

const HOME_CACHE_KEY = 'moviemind_home_catalogue_v2';
const RECS_CACHE_KEY = 'moviemind_recommendations_v2';

function hasValidPoster(movie) {
  if (!movie) return false;
  const p = movie.poster || movie.Poster || movie.poster_url || movie.posterUrl || movie.image;
  if (!p) return false;
  const str = String(p).trim().toLowerCase();
  if (str === '' || str === 'n/a' || str === 'null' || str === 'undefined' || str === 'none') return false;
  return true;
}

export function getMovieIdentity(movie) {
  if (!movie) return '';
  const title = String(movie.title || movie.Title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ' ');
  const year = String(movie.year || movie.Year || '').trim();
  if (title) {
    return `title-${title}-${year}`;
  }
  if (movie.imdbID || movie.imdbId) {
    const imdb = String(movie.imdbID || movie.imdbId).trim().toLowerCase();
    if (imdb && imdb !== 'n/a' && imdb !== 'null' && imdb !== 'undefined') {
      return `imdb-${imdb}`;
    }
  }
  if (movie.movieId != null && String(movie.movieId) !== 'undefined' && String(movie.movieId) !== 'null') {
    return `id-${movie.movieId}`;
  }
  if (movie.tmdb_id || movie.tmdbId) {
    return `tmdb-${movie.tmdb_id || movie.tmdbId}`;
  }
  return '';
}

function getStoredHomeCatalogue() {
  try {
    const raw = localStorage.getItem(HOME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.data) return null;
    const data = parsed.data;
    if (!data.hero || !Array.isArray(data.hero) || data.hero.length === 0) return null;
    if (!hasValidPoster(data.hero[0])) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function setStoredHomeCatalogue(data) {
  try {
    if (!data || !data.hero || data.hero.length === 0) return;
    localStorage.setItem(HOME_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch (e) {
    // Ignore storage quota errors
  }
}

function getStoredRecommendations() {
  try {
    const raw = localStorage.getItem(RECS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.data) || parsed.data.length === 0) return null;
    if (!hasValidPoster(parsed.data[0])) return null;
    return parsed.data;
  } catch (e) {
    return null;
  }
}

function setStoredRecommendations(recs) {
  try {
    if (!Array.isArray(recs) || recs.length === 0) return;
    localStorage.setItem(RECS_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: recs
    }));
  } catch (e) {
    // Ignore storage quota errors
  }
}

export default function Home({
  searchQuery,
  onMovieSelect,
  categoryFilter,
  onBack
}) {
  const [catalogueData, setCatalogueData] = useState(() => {
    if (cachedHomeCatalogue) return cachedHomeCatalogue;
    const stored = getStoredHomeCatalogue();
    if (stored) {
      cachedHomeCatalogue = stored;
      return stored;
    }
    return null;
  });

  const [recommended, setRecommended] = useState(() => {
    if (cachedRecommendations) return cachedRecommendations;
    const stored = getStoredRecommendations();
    if (stored) {
      cachedRecommendations = stored;
      return stored;
    }
    return null;
  });

  const [teluguRow, setTeluguRow] = useState(() => {
    if (cachedTeluguRow) return cachedTeluguRow;
    const storedHome = getStoredHomeCatalogue();
    if (storedHome?.telugu_blockbusters?.length > 0) {
      const valid = storedHome.telugu_blockbusters.filter(hasValidPoster);
      if (valid.length > 0) {
        cachedTeluguRow = valid;
        return valid;
      }
    }
    return (FALLBACK_CATALOGUE.telugu || []).filter(hasValidPoster);
  });

  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingCatalogue, setLoadingCatalogue] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [categoryFilter]);

  // =====================================================
  // LOAD MOVIEMIND HOME CATALOGUE (API-FIRST WITH PERSISTENT CACHE)
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const loadCatalogue = async () => {
      if (!catalogueData) {
        setLoadingCatalogue(true);
      }

      try {
        const data = await api.getHomeMovies();
        if (!isMounted) return;

        if (data && data.hero && data.hero.length > 0) {
          cachedHomeCatalogue = data;
          setStoredHomeCatalogue(data);

          if (data.telugu_blockbusters && data.telugu_blockbusters.length > 0) {
            const validTelugu = data.telugu_blockbusters.filter(hasValidPoster);
            if (validTelugu.length > 0) {
              cachedTeluguRow = validTelugu;
              setTeluguRow(validTelugu);
            }
          }

          const oldKeys = (catalogueData?.hero || []).map(getMovieIdentity).join(',');
          const newKeys = (data.hero || []).map(getMovieIdentity).join(',');

          if (!catalogueData || oldKeys !== newKeys) {
            setCatalogueData(data);
          }
        } else if (!catalogueData) {
          cachedHomeCatalogue = FALLBACK_CATALOGUE;
          setCatalogueData(FALLBACK_CATALOGUE);
        }
      } catch (error) {
        console.error('Home catalogue API call failed:', error);
        if (!catalogueData && isMounted) {
          cachedHomeCatalogue = FALLBACK_CATALOGUE;
          setCatalogueData(FALLBACK_CATALOGUE);
        }
      } finally {
        if (isMounted) setLoadingCatalogue(false);
      }
    };

    loadCatalogue();
    return () => { isMounted = false; };
  }, []);

  // =====================================================
  // LOAD PERSONALIZED AI RECOMMENDATIONS
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const loadRecommendations = async () => {
      if (!recommended || recommended.length < 4) {
        setLoadingRecs(true);
      }

      try {
        const data = await api.getRecommendations(1, 11);
        if (!isMounted) return;

        const originalRecommendations = data?.recommendations || (Array.isArray(data) ? data : []);
        const rankedRecommendations = movieMindRanker.rankMovies(originalRecommendations);

        let enrichedRecommendations = [];
        try {
          enrichedRecommendations = await movieEnrichmentService.enrichMovies(rankedRecommendations);
        } catch (enrichErr) {
          console.warn('Enrichment failed, preserving original ranked recommendations:', enrichErr);
          enrichedRecommendations = rankedRecommendations;
        }

        const validRecs = (enrichedRecommendations || []).filter(hasValidPoster);
        const finalRecs = validRecs.length > 0 ? validRecs : (rankedRecommendations || []).filter(hasValidPoster);

        // Merge with home catalogue recommendations and fallback pool to guarantee a full carousel (8-15 cards)
        const additionalPool = [
          ...(catalogueData?.recommended || []),
          ...(FALLBACK_CATALOGUE.recommended || [])
        ].filter(hasValidPoster);

        const existingKeys = new Set(finalRecs.map(getMovieIdentity));

        for (const item of additionalPool) {
          const key = getMovieIdentity(item);
          if (key && !existingKeys.has(key)) {
            finalRecs.push(item);
            existingKeys.add(key);
          }
        }

        cachedRecommendations = finalRecs;
        setStoredRecommendations(finalRecs);

        if (isMounted) {
          setRecommended(finalRecs);
        }
      } catch (error) {
        console.error('Recommendation loading failed:', error);
        if (isMounted) {
          const fallbackPool = [
            ...(catalogueData?.recommended || []),
            ...(FALLBACK_CATALOGUE.recommended || [])
          ].filter(hasValidPoster);

          if (fallbackPool.length > 0) {
            cachedRecommendations = fallbackPool;
            setRecommended(fallbackPool);
          }
        }
      } finally {
        if (isMounted) {
          setLoadingRecs(false);
        }
      }
    };

    loadRecommendations();
    return () => { isMounted = false; };
  }, [catalogueData]);

  // =====================================================
  // CATEGORY PAGE FILTER
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
      },
      explore: {
        key: 'top_rated',
        title: '🧭 Explore Movies'
      }
    };

    const config = categoryConfig[categoryFilter];
    const rawMovies = config && catalogueData ? (catalogueData[config.key] || []) : [];
    const movies = (rawMovies || []).filter(hasValidPoster);

    return (
      <div className="home-page">
        <div className="category-page">
          {onBack && <BackButton onBack={onBack} />}
          <div className="category-page-header">
            <span className="source-label">MOVIEMIND COLLECTION</span>
            <h2 className="category-page-title">{config?.title || 'Movies'}</h2>
            <p>Explore curated movies from MovieMind.</p>
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
  // GLOBAL HOMEPAGE DEDUPLICATION
  // Process rows in display order so no movie repeats.
  // =====================================================

  const seenMovieKeys = new Set();

  // 1. Hero banner movies (register keys so they don't repeat below)
  if (catalogueData?.hero && catalogueData.hero.length > 0) {
    catalogueData.hero.forEach(m => {
      const k = getMovieIdentity(m);
      if (k) seenMovieKeys.add(k);
    });
  }

  // 2. Personalized Recommendations ("⚡ Your Cinematic Signal")
  const deduplicatedRecommended = (recommended || []).filter(movie => {
    if (!hasValidPoster(movie)) return false;
    const key = getMovieIdentity(movie);
    if (!key || seenMovieKeys.has(key)) return false;
    seenMovieKeys.add(key);
    return true;
  });

  // 3. Category definitions in exact display order:
  const rawCategories = [
    {
      key: 'telugu',
      title: '🔥 Top Telugu Blockbusters',
      source: (catalogueData?.telugu_blockbusters && catalogueData.telugu_blockbusters.length > 0)
        ? catalogueData.telugu_blockbusters
        : (teluguRow || FALLBACK_CATALOGUE.telugu || [])
    },
    {
      key: 'trending',
      title: '🔥 Trending Now',
      source: (catalogueData?.trending && catalogueData.trending.length > 0)
        ? catalogueData.trending
        : (FALLBACK_CATALOGUE.trending || [])
    },
    {
      key: 'top_rated',
      title: '⭐ Top Rated',
      source: (catalogueData?.top_rated && catalogueData.top_rated.length > 0)
        ? catalogueData.top_rated
        : (FALLBACK_CATALOGUE.top_rated || [])
    },
    {
      key: 'blockbusters',
      title: '💥 Blockbusters',
      source: (catalogueData?.blockbusters && catalogueData.blockbusters.length > 0)
        ? catalogueData.blockbusters
        : (FALLBACK_CATALOGUE.blockbusters || [])
    },
    {
      key: 'action',
      title: '🔥 Action & Thriller',
      source: (catalogueData?.action && catalogueData.action.length > 0)
        ? catalogueData.action
        : (FALLBACK_CATALOGUE.action || [])
    },
    {
      key: 'romance',
      title: '❤️ Romance',
      source: (catalogueData?.romance && catalogueData.romance.length > 0)
        ? catalogueData.romance
        : (FALLBACK_CATALOGUE.romance || [])
    },
    {
      key: 'drama',
      title: '🎭 Drama',
      source: (catalogueData?.drama && catalogueData.drama.length > 0)
        ? catalogueData.drama
        : (FALLBACK_CATALOGUE.drama || [])
    },
    {
      key: 'crime',
      title: '🔎 Crime & Mystery',
      source: (catalogueData?.crime && catalogueData.crime.length > 0)
        ? catalogueData.crime
        : (FALLBACK_CATALOGUE.crime || [])
    },
    {
      key: 'comedy',
      title: '😂 Comedy',
      source: (catalogueData?.comedy && catalogueData.comedy.length > 0)
        ? catalogueData.comedy
        : (FALLBACK_CATALOGUE.comedy || [])
    },
    {
      key: 'family',
      title: '👨‍👩‍👧 Family Entertainment',
      source: (catalogueData?.family && catalogueData.family.length > 0)
        ? catalogueData.family
        : (FALLBACK_CATALOGUE.family || [])
    },
    {
      key: 'award_winning',
      title: '🏆 Award Winning',
      source: (catalogueData?.award_winning && catalogueData.award_winning.length > 0)
        ? catalogueData.award_winning
        : (FALLBACK_CATALOGUE.award_winning || [])
    },
    {
      key: 'hidden_gems',
      title: '💎 Hidden Gems',
      source: (catalogueData?.hidden_gems && catalogueData.hidden_gems.length > 0)
        ? catalogueData.hidden_gems
        : (FALLBACK_CATALOGUE.hidden_gems || [])
    }
  ];

  const categories = rawCategories.map(cat => {
    const rowSeen = new Set();
    const movies = (cat.source || []).filter(movie => {
      if (!hasValidPoster(movie)) return false;
      const key = getMovieIdentity(movie);
      if (!key || rowSeen.has(key)) return false;
      rowSeen.add(key);
      return true;
    });

    return {
      key: cat.key,
      title: cat.title,
      movies
    };
  });

  return (
    <div className="home-page">

      {/* HERO / SKELETON */}
      {catalogueData?.hero?.length > 0 ? (
        <Hero
          movies={catalogueData.hero}
          onMovieSelect={onMovieSelect}
        />
      ) : (
        <div className="hero-skeleton-loader" style={{
          height: '480px', width: '100%', borderRadius: '24px',
          background: 'linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%)',
          backgroundSize: '200% 100%', animation: 'skeletonShimmer 1.8s infinite',
          marginBottom: '32px'
        }} />
      )}

      <div className="home-sections">

        {/* PERSONALIZED RECOMMENDATIONS */}
        {loadingRecs && !deduplicatedRecommended.length ? (
          <div className="carousel-skeleton-loader" style={{ padding: '20px 0' }}>
            <div style={{ height: '24px', width: '220px', background: '#1e293b', borderRadius: '6px', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} style={{ width: '180px', height: '270px', borderRadius: '12px', background: '#1e293b', flexShrink: 0 }} />
              ))}
            </div>
          </div>
        ) : (
          deduplicatedRecommended.length > 0 && (
            <MovieCarousel
              title="⚡ Your Cinematic Signal"
              movies={deduplicatedRecommended}
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
