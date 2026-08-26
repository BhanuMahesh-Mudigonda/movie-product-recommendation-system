import { movieSearchService } from './MovieSearchService';
import { normalizeMovie } from '../utils/movieUtils';

class MovieEnrichmentService {

  hasValue(value) {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim() !== '' && value !== 'N/A';
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return true;
  }

  mergeMovie(existing, enriched) {
    const base = normalizeMovie(existing) || existing || {};
    const extra = normalizeMovie(enriched) || enriched || {};

    return normalizeMovie({
      ...extra,
      ...base,

      poster:
        this.hasValue(base.poster)
          ? base.poster
          : extra.poster,

      backdrop:
        this.hasValue(base.backdrop)
          ? base.backdrop
          : extra.backdrop,

      overview:
        this.hasValue(base.overview)
          ? base.overview
          : extra.overview,

      cast:
        this.hasValue(base.cast)
          ? base.cast
          : extra.cast,

      director:
        this.hasValue(base.director)
          ? base.director
          : extra.director,

      runtime:
        this.hasValue(base.runtime)
          ? base.runtime
          : extra.runtime,

      trailer:
        this.hasValue(base.trailer?.url)
          ? base.trailer
          : extra.trailer,

      genres:
        this.hasValue(base.genres)
          ? base.genres
          : extra.genres,

      rating:
        this.hasValue(base.rating)
          ? base.rating
          : extra.rating,

      year:
        this.hasValue(base.year)
          ? base.year
          : extra.year,

      language:
        this.hasValue(base.language)
          ? base.language
          : extra.language
    });
  }

  needsEnrichment(movie) {
    const normalized =
      normalizeMovie(movie) || movie || {};

    const missingPoster =
      !this.hasValue(normalized.poster);

    const missingOverview =
      !this.hasValue(normalized.overview);

    const missingCast =
      !this.hasValue(normalized.cast);

    return (
      missingPoster ||
      missingOverview ||
      missingCast
    );
  }

  async enrichMovie(movie) {

    if (!movie) {
      return null;
    }

    const normalized =
      normalizeMovie(movie) || movie;

    if (!this.needsEnrichment(normalized)) {
      return normalized;
    }

    try {

      const enriched =
        await movieSearchService
          .enrichMovieMetadata(normalized);

      return this.mergeMovie(
        normalized,
        enriched
      );

    } catch (error) {

      console.error(
        'Movie enrichment failed:',
        error
      );

      return normalized;
    }
  }

  async enrichMovies(movies = []) {
    if (!Array.isArray(movies) || movies.length === 0) {
      return [];
    }

    try {
      const enrichmentPromise = Promise.all(
        movies.map(movie => this.enrichMovie(movie))
      );
      
      const timeoutPromise = new Promise(resolve => 
        setTimeout(() => resolve(movies.map(normalizeMovie).filter(Boolean)), 1200)
      );

      const results = await Promise.race([enrichmentPromise, timeoutPromise]);
      return (results && results.length > 0) ? results.filter(Boolean) : movies.map(normalizeMovie).filter(Boolean);
    } catch (e) {
      return movies.map(normalizeMovie).filter(Boolean);
    }
  }
}

export const movieEnrichmentService =
  new MovieEnrichmentService();
