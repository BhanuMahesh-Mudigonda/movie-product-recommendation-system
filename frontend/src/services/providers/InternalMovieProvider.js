import { api } from '../api';
import { normalizeMovie } from '../../utils/movieUtils';

export class InternalMovieProvider {
  /**
   * Unified MovieMind search provider.
   *
   * Backend handles:
   * - Featured 161 movies
   * - Exact title search
   * - Discovery / semantic search
   * - Approved TMDB multilingual movies
   */
  async search(query) {
    try {
      const data = await api.searchMovies(query, 30);

      return (Array.isArray(data) ? data : [])
        .map(movie => {
          const normalized = normalizeMovie(movie);

          return {
            ...normalized,

            // Preserve backend identity
            source:
              movie.source ||
              normalized.source ||
              'featured',

            // TMDB/discovery movies are external metadata movies.
            // Featured 161 movies remain ecosystem-native.
            isExternal:
              movie.source === 'multilingual' ||
              movie.source === 'global'
          };
        });

    } catch (error) {
      console.error(
        'MovieMind search provider error:',
        error
      );

      return [];
    }
  }
}
