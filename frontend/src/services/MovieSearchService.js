import { InternalMovieProvider } from './providers/InternalMovieProvider';
import { GlobalMovieProvider } from './providers/GlobalMovieProvider';
import { api } from './api';
import { movieMindRanker } from './movieMindRanker';

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

    if (trailerUrl && typeof trailerUrl === 'string') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = typeof trailerUrl === 'string' ? trailerUrl.match(regExp) : null;
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
      movieId: movie.moviemind_id || movie.movieId || movie.id || movie.imdbID,
      title,
      original_title: movie.original_title || title,
      poster: movie.poster_url || ((movie.poster && movie.poster !== 'N/A') ? movie.poster : ((movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : null)),
      backdrop: movie.backdrop || movie.backdrop_url || null,
      rating: movie.rating ?? movie.imdbRating ?? movie.vote_average ?? movie.avg_rating ?? null,
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

  async search(query, searchIntent = null) {
    const cleanQuery = String(query || '').trim();

    if (!cleanQuery) return [];

    try {
      // ==================================================
      // PRIMARY: MovieMind Global Catalogue
      // ==================================================
      const catalogueResponse =
        await api.searchCatalogueMovies(
          cleanQuery,
          20
        );

      const catalogueMovies =
        catalogueResponse?.movies || (Array.isArray(catalogueResponse) ? catalogueResponse : []);

      if (
        Array.isArray(catalogueMovies) &&
        catalogueMovies.length > 0
      ) {
        const normalizedMovies =
          catalogueMovies
            .map(movie => this._normalize(movie))
            .filter(Boolean);

        return movieMindRanker.rankMovies(
          normalizedMovies, searchIntent
        );
      }

      // ==================================================
      // FALLBACK: Existing MovieMind Search
      // Existing recommendation/search logic remains intact
      // ==================================================
      const results =
        await this.internalProvider.search(
          cleanQuery
        );

      return (results || []).map(movie =>
        this._normalize(movie)
      );

    } catch (error) {

      console.error(
        'MovieMind catalogue search error:',
        error
      );

      // Safe fallback — existing system remains functional
      try {

        const results =
          await this.internalProvider.search(
            cleanQuery
          );

        const normalizedMovies =
        (results || [])
          .map(movie => this._normalize(movie))
          .filter(Boolean);

      return movieMindRanker.rankMovies(
        normalizedMovies, searchIntent
      );

      } catch (fallbackError) {

        console.error(
          'MovieMind fallback search error:',
          fallbackError
        );

        return [];
      }
    }
  }

  async enrichMovieMetadata(movie) {
    if (!movie) return null;

    // --------------------------------------------------
    // BASE NORMALIZATION
    // Keep existing MovieMind/model data untouched
    // --------------------------------------------------
    let norm = this._normalize(movie);

    if (!norm) return null;

    // --------------------------------------------------
    // CHECK WHAT INFORMATION IS ACTUALLY MISSING
    // Poster alone must NOT stop enrichment.
    // --------------------------------------------------
    const needsEnrichment =
      !norm.poster ||
      !norm.overview ||
      !norm.director ||
      !norm.backdrop ||
      !norm.cast?.length ||
      !norm.runtime ||
      !norm.trailer?.url ||
      norm.trailer?.status === 'not_found';

    // Already complete enough → preserve existing data
    if (!needsEnrichment) {
      return norm;
    }

    try {
      const searchQuery =
        norm.original_title ||
        norm.title;

      if (!searchQuery) {
        return norm;
      }

      // --------------------------------------------------
      // GLOBAL METADATA LOOKUP
      // Add missing information only.
      // Never overwrite strong MovieMind/model data.
      // --------------------------------------------------
      const globalResults =
        await this.globalProvider.search(
          searchQuery
        );

      if (
        !Array.isArray(globalResults) ||
        globalResults.length === 0
      ) {
        return norm;
      }

      const match = globalResults[0];

      // --------------------------------------------------
      // ADDITIVE MERGE
      // Existing MovieMind data has priority.
      // External data only fills gaps.
      // --------------------------------------------------
      const enrichedRaw = {
        ...norm.originalData,

        movieId:
          norm.movieId,

        title:
          norm.title,

        original_title:
          norm.original_title,

        poster:
          norm.poster ||
          match.poster ||
          match.Poster ||
          match.poster_url ||
          null,

        backdrop:
          norm.backdrop ||
          match.backdrop ||
          match.backdrop_url ||
          match.backdrop_path ||
          null,

        rating:
          norm.rating ??
          match.rating ??
          match.imdbRating ??
          match.vote_average ??
          null,

        year:
          norm.year ||
          match.year ||
          match.Year ||
          match.release_year ||
          '',

        language:
          norm.language ||
          match.language ||
          match.Language ||
          match.original_language ||
          '',

        genres:
          norm.genres ||
          match.genres ||
          match.genre ||
          match.Genre ||
          '',

        overview:
          norm.overview ||
          match.overview ||
          match.plot ||
          match.Plot ||
          match.description ||
          null,

        cast:
          norm.cast?.length
            ? norm.cast
            : (
                match.cast ||
                match.Actors ||
                match.actors ||
                []
              ),

        director:
          norm.director ||
          match.director ||
          match.Director ||
          null,

        runtime:
          norm.runtime ||
          match.runtime ||
          match.Runtime ||
          null,

        trailer:
          (
            norm.trailer?.status !== 'not_found' &&
            norm.trailer?.url
          )
            ? norm.trailer
            : (
                match.trailer ||
                match.trailer_url ||
                null
              ),

        recommendation:
          norm.recommendation,

        isExternal:
          norm.isExternal
      };

      return this._normalize(enrichedRaw);

    } catch (error) {

      console.error(
        'Deep metadata enrichment failed:',
        error
      );

      // Safe fallback:
      // Existing MovieMind movie always remains usable.
      return norm;
    }
  }
}

export const movieSearchService = new MovieSearchService();
