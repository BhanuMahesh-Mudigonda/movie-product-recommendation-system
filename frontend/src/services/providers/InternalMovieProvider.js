import { api } from '../api';
import { normalizeMovie } from '../../utils/movieUtils';

export class InternalMovieProvider {
  /**
   * Search the internal MovieMind catalogue
   */
  async search(query) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/movies/search?q=${encodeURIComponent(query)}&limit=30`);
      if (!response.ok) {
        return [];
      }
      
      let data = await response.json();
      data = Array.isArray(data) ? data : [];
      
      // Normalize and explicitly mark as internal
      return data.map(movie => ({
        ...normalizeMovie(movie),
        isExternal: false,
        source: 'internal'
      }));
    } catch (error) {
      console.error('InternalMovieProvider search error:', error);
      return [];
    }
  }
}
