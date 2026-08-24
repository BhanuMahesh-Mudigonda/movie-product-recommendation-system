import { api } from '../api';
import { normalizeMovie } from '../../utils/movieUtils';

export class GlobalMovieProvider {
  /**
   * Search the configured global movie metadata provider via backend proxy
   * to keep API credentials secure on the server side.
   */
  async search(query) {
    try {
      const response = await api.searchExternalMovies(query, 1);
      
      if (response && response.results && Array.isArray(response.results)) {
        // Normalize and explicitly mark as external fallback
        return response.results.map(movie => ({
          ...normalizeMovie(movie),
          isExternal: true,
          source: 'global'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('GlobalMovieProvider search error:', error);
      return [];
    }
  }
}
