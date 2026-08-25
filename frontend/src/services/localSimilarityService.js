import { api } from './api.js';
import { normalizeMovie } from '../utils/movieUtils.js';

const relatedCache = new Map();
let localDatasetPool = null;

function hasValidPoster(movie) {
  if (!movie) return false;
  const p = movie.poster || movie.Poster || movie.poster_url || movie.posterUrl || movie.image;
  if (!p) return false;
  const str = String(p).trim().toLowerCase();
  if (str === '' || str === 'n/a' || str === 'null' || str === 'undefined' || str === 'none') return false;
  return true;
}

export const localSimilarityService = {
  async getLocalDatasetPool() {
    if (localDatasetPool && localDatasetPool.length > 0) {
      return localDatasetPool;
    }

    try {
      const data = await api.getHomeMovies();
      const pool = [];
      const usedIds = new Set();

      if (data && typeof data === 'object') {
        Object.values(data).forEach(catList => {
          if (Array.isArray(catList)) {
            catList.forEach(raw => {
              const norm = normalizeMovie(raw);
              if (norm && hasValidPoster(norm)) {
                const id = String(norm.movieId || norm.id || norm.title).toLowerCase().trim();
                if (!usedIds.has(id)) {
                  usedIds.add(id);
                  pool.push(norm);
                }
              }
            });
          }
        });
      }

      if (pool.length === 0) {
        const fallback = await api.getPopularMovies(40);
        if (Array.isArray(fallback)) {
          fallback.forEach(raw => {
            const norm = normalizeMovie(raw);
            if (norm && hasValidPoster(norm)) {
              const id = String(norm.movieId || norm.id || norm.title).toLowerCase().trim();
              if (!usedIds.has(id)) {
                usedIds.add(id);
                pool.push(norm);
              }
            }
          });
        }
      }

      localDatasetPool = pool;
      return localDatasetPool;
    } catch (err) {
      console.error("Failed to load local dataset pool:", err);
      return [];
    }
  },

  async getRelatedMovies(targetMovie, limit = 10) {
    if (!targetMovie || typeof targetMovie !== 'object') return [];

    try {
      const normTarget = normalizeMovie(targetMovie) || targetMovie || {};
      const targetId = String(normTarget.movieId || normTarget.id || normTarget.title || '').toLowerCase().trim();

      if (targetId && relatedCache.has(targetId)) {
        return relatedCache.get(targetId);
      }

      const pool = await this.getLocalDatasetPool();
      if (!Array.isArray(pool) || pool.length === 0) return [];

      const targetTitle = String(normTarget.title || '').toLowerCase().trim();
      const targetLang = String(normTarget.language || normTarget.languageCode || '').toLowerCase().trim();
      const targetYear = parseInt(normTarget.year);
      const targetRating = parseFloat(normTarget.rating);

      let targetGenres = [];
      if (Array.isArray(normTarget.genres)) {
        targetGenres = normTarget.genres.map(g => typeof g === 'object' ? (g.name || g.title || '') : String(g)).map(g => g.toLowerCase().trim()).filter(Boolean);
      } else if (typeof normTarget.genres === 'string') {
        targetGenres = normTarget.genres.toLowerCase().replace(/\|/g, ',').split(',').map(g => g.trim()).filter(Boolean);
      }

      const scored = pool
        .filter(cand => {
          if (!cand || !hasValidPoster(cand)) return false;
          const candId = String(cand.movieId || cand.id || cand.title || '').toLowerCase().trim();
          const candTitle = String(cand.title || '').toLowerCase().trim();
          if ((targetId && candId && candId === targetId) || (targetTitle && candTitle && candTitle === targetTitle)) return false;
          return true;
        })
        .map(cand => {
          let score = 0;

          let candGenres = [];
          if (Array.isArray(cand.genres)) {
            candGenres = cand.genres.map(g => typeof g === 'object' ? (g.name || g.title || '') : String(g)).map(g => g.toLowerCase().trim()).filter(Boolean);
          } else if (typeof cand.genres === 'string') {
            candGenres = cand.genres.toLowerCase().replace(/\|/g, ',').split(',').map(g => g.trim()).filter(Boolean);
          }

          const matchingGenres = targetGenres.filter(g =>
            candGenres.some(cg => cg.includes(g) || g.includes(cg))
          );

          if (matchingGenres.length > 0) {
            score += 5;
            if (matchingGenres.length > 1) {
              score += (matchingGenres.length - 1) * 3;
            }
          }

          const candLang = String(cand.language || cand.languageCode || '').toLowerCase().trim();
          if (targetLang && candLang && (targetLang.includes(candLang) || candLang.includes(targetLang))) {
            score += 3;
          }

          const candRating = parseFloat(cand.rating);
          if (!isNaN(targetRating) && !isNaN(candRating) && Math.abs(targetRating - candRating) <= 1.0) {
            score += 2;
          }

          const candYear = parseInt(cand.year);
          if (!isNaN(targetYear) && !isNaN(candYear) && Math.abs(targetYear - candYear) <= 5) {
            score += 2;
          }

          if (!isNaN(candRating)) {
            score += Math.min(candRating * 0.3, 3);
          }

          return { movie: cand, score };
        })
        .sort((a, b) => b.score - a.score);

      let finalResults = scored.slice(0, limit).map(item => item.movie);

      // Progressive Fallback: Guarantee at least 6 recommendations at all times
      if (finalResults.length < 6) {
        const existingIds = new Set(finalResults.map(m => String(m.movieId || m.id || m.title).toLowerCase().trim()));
        for (const cand of pool) {
          if (!cand || !hasValidPoster(cand)) continue;
          const candId = String(cand.movieId || cand.id || cand.title).toLowerCase().trim();
          if (candId !== targetId && !existingIds.has(candId)) {
            finalResults.push(cand);
            existingIds.add(candId);
            if (finalResults.length >= limit) break;
          }
        }
      }

      if (targetId) {
        relatedCache.set(targetId, finalResults);
      }
      return finalResults;
    } catch (err) {
      console.error("localSimilarityService error:", err);
      return [];
    }
  }
};
