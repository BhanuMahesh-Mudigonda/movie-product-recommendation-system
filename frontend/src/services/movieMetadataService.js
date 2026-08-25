import { localSimilarityService } from './localSimilarityService.js';
import { normalizeMovie } from '../utils/movieUtils.js';

const metadataCache = new Map();

export const movieMetadataService = {
  async getEnrichedMetadata(movie) {
    if (!movie) {
      return { cast: [], director: '' };
    }

    const norm = normalizeMovie(movie) || movie;
    const movieId = String(norm.movieId || norm.id || norm.imdbID || norm.title || '').toLowerCase().trim();

    if (metadataCache.has(movieId)) {
      return metadataCache.get(movieId);
    }

    let cast = [];
    let director = '';

    // 1. Direct fields check
    const rawCast =
      movie.cast ||
      movie.actors ||
      movie.Actors ||
      movie.actor_names ||
      norm.cast ||
      [];

    if (Array.isArray(rawCast)) {
      cast = rawCast
        .map(c => typeof c === 'string' ? { name: c.trim() } : c)
        .filter(c => c && (c.name || typeof c === 'string'));
    } else if (typeof rawCast === 'string' && rawCast !== 'N/A' && rawCast.trim() !== '') {
      cast = rawCast
        .split(',')
        .map(name => ({ name: name.trim() }))
        .filter(c => c.name);
    }

    director =
      movie.director ||
      movie.Director ||
      movie.directors ||
      norm.director ||
      '';

    if (typeof director === 'object') {
      director = director.name || director.title || '';
    }
    director = String(director || '').trim();
    if (director.toLowerCase().includes('enrich')) {
      director = '';
    }

    // 2. Smart local matching against local dataset pool if cast or director is missing
    if (cast.length === 0 || !director) {
      try {
        const pool = await localSimilarityService.getLocalDatasetPool();
        const targetTitle = String(norm.title || movie.title || '').toLowerCase().trim();

        if (pool && pool.length > 0 && (movieId || targetTitle)) {
          const match = pool.find(cand => {
            const candId = String(cand.movieId || cand.id || cand.imdbID || '').toLowerCase().trim();
            const candTitle = String(cand.title || '').toLowerCase().trim();
            return (movieId && candId && movieId === candId) ||
                   (targetTitle && candTitle && (candTitle.includes(targetTitle) || targetTitle.includes(candTitle)));
          });

          if (match) {
            if (cast.length === 0) {
              const mCast = match.cast || match.actors || match.Actors;
              if (Array.isArray(mCast)) {
                cast = mCast.map(c => typeof c === 'string' ? { name: c.trim() } : c).filter(c => c && c.name);
              } else if (typeof mCast === 'string' && mCast !== 'N/A') {
                cast = mCast.split(',').map(n => ({ name: n.trim() })).filter(c => c.name);
              }
            }

            if (!director) {
              const mDir = match.director || match.Director || '';
              if (mDir && !String(mDir).toLowerCase().includes('enrich')) {
                director = String(mDir).trim();
              }
            }
          }
        }
      } catch (err) {
        console.warn("Local metadata enrichment warning:", err);
      }
    }

    // Standardize cast structure & limit to top 5 main members
    const formattedCast = cast
      .slice(0, 5)
      .map(actor => {
        if (typeof actor === 'string') return { name: actor.trim() };
        return {
          name: actor.name || actor.original_name || 'Actor',
          character: actor.character || '',
          image: actor.image || actor.profile || actor.profile_path || null
        };
      })
      .filter(actor => actor.name && actor.name !== 'Actor');

    const result = {
      cast: formattedCast,
      director: director || ''
    };

    if (movieId) {
      metadataCache.set(movieId, result);
    }

    return result;
  }
};
