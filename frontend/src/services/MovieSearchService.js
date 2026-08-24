import { InternalMovieProvider } from './providers/InternalMovieProvider';
import { GlobalMovieProvider } from './providers/GlobalMovieProvider';

class MovieSearchService {
  constructor() {
    this.internalProvider = new InternalMovieProvider();
    this.globalProvider = new GlobalMovieProvider();
  }

  /**
   * Deeply normalize a movie into the requested strict schema
   */
  _normalize(movie) {
    if (!movie) return null;

    const title = movie.title || movie.Title || movie.name || movie.original_title || 'Unknown Movie';
    const year = movie.year || movie.Year || movie.release_year || '';
    
    // Trailer Logic
    let trailerUrl = typeof movie.trailer === 'string' && movie.trailer !== 'N/A' ? movie.trailer : null;
    let trailerStatus = 'not_found';
    let embedUrl = null;

    if (trailerUrl) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = trailerUrl.match(regExp);
      if (match && match[2].length === 11) {
        trailerStatus = 'official';
        embedUrl = `https://www.youtube.com/embed/${match[2]}?autoplay=1&controls=1&rel=0`;
      } else {
        trailerStatus = 'official'; // but not embeddable
      }
    } else {
      trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${year} official trailer`)}`;
      trailerStatus = 'search_fallback';
    }
    
    if (movie?.trailer?.url) {
        // If it's already normalized
        trailerUrl = movie.trailer.url;
        trailerStatus = movie.trailer.status;
        embedUrl = movie.trailer.embedUrl;
    }

    // Cast Logic (parse string to array of objects)
    let cast = [];
    const castRaw = movie.cast || movie.Actors || movie.actors;
    if (Array.isArray(castRaw)) {
      cast = castRaw.map(c => typeof c === 'string' ? { name: c, character: '', image: null } : c);
    } else if (typeof castRaw === 'string' && castRaw !== 'N/A') {
      cast = castRaw.split(',').map(name => ({
        name: name.trim(),
        character: '',
        image: null
      }));
    }

    // Genres Logic
    const rawGenre = movie.genre || movie.genres || movie.Genre || '';
    const genres = Array.isArray(rawGenre) 
      ? rawGenre.join(' • ') 
      : String(rawGenre).replace(/\|/g, ',').split(',').map(g => g.trim()).filter(Boolean).join(' • ');

    const score = movie.score || movie.recommendationScore || 0;
    
    // AI Reasons Logic
    let reasons = [];
    if (!movie.isExternal) {
      if (score > 85) reasons.push("Strong genre similarity");
      else if (score > 70) reasons.push("High content similarity");
      else reasons.push("Matches movies in your favourites");
      
      reasons.push("Similar rating pattern");
    }

    return {
      movieId: movie.movieId || movie.id || movie.imdbID,
      title,
      original_title: movie.original_title || title,
      poster: (movie.poster && movie.poster !== 'N/A') ? movie.poster : ((movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : null),
      backdrop: movie.backdrop || null,
      rating: movie.rating || movie.imdbRating || movie.vote_average || movie.avg_rating || null,
      year,
      language: movie.language || movie.Language || movie.language_code || movie.original_language || '',
      genres,
      runtime: movie.runtime || movie.Runtime || null,
      overview: movie.overview || movie.Plot || movie.plot || movie.description || null,
      cast,
      director: movie.director || movie.Director || null,
      trailer: {
        status: trailerStatus,
        url: trailerUrl,
        embedUrl
      },
      recommendation: {
        score,
        reasons
      },
      isExternal: movie.isExternal || false,
      
      // Preserve some original fields for API compat
      originalData: movie
    };
  }

  async search(query) {
    const cleanQuery = String(query || '').trim();
    if (!cleanQuery) return [];

    const internalResults = await this.internalProvider.search(cleanQuery);
    if (internalResults.length > 0) {
      return internalResults.map(m => this._normalize(m));
    }

    const globalResults = await this.globalProvider.search(cleanQuery);
    return (globalResults || []).map(m => this._normalize(m));
  }

  async enrichMovieMetadata(movie) {
    if (!movie) return null;
    let norm = this._normalize(movie);

    if (norm.isExternal) return norm;
    if (norm.poster && String(norm.poster).startsWith('http')) return norm;

    try {
      const searchQuery = norm.original_title || norm.title;
      if (!searchQuery) return norm;

      const globalResults = await this.globalProvider.search(searchQuery);
      if (globalResults && globalResults.length > 0) {
        const match = globalResults[0];
        const enrichedRaw = {
          ...norm.originalData,
          poster: match.poster || match.Poster || norm.poster,
          backdrop: match.backdrop || norm.backdrop,
          rating: match.rating || match.imdbRating || norm.rating,
          language: match.language || match.Language || norm.language,
          genres: match.genres || match.Genre || norm.originalData.genres,
          overview: match.overview || norm.overview,
          cast: match.cast || match.Actors || norm.originalData.cast,
          director: match.director || match.Director || norm.director,
          trailer: match.trailer || norm.originalData.trailer,
          runtime: match.runtime || match.Runtime || norm.runtime
        };
        return this._normalize(enrichedRaw);
      }
      return norm;
    } catch (error) {
      console.error('Failed to enrich metadata:', error);
      return norm;
    }
  }
}

export const movieSearchService = new MovieSearchService();
