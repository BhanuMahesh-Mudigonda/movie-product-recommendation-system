import { normalizeMovie } from '../utils/movieUtils.js';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api';

const fetchOptions = {
  headers: {
    'Bypass-Tunnel-Reminder': 'true'
  }
};

async function safeFetch(url) {
  try {
    const res = await fetch(url, fetchOptions);
    const text = await res.text();

    if (!res.ok) {
      console.error(
        `API Error ${res.status} for ${url}:`,
        text.substring(0, 300)
      );

      return url.includes('analytics')
        ? { stats: {}, charts: {} }
        : null;
    }

    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed.map(normalizeMovie);
      }

      if (
        parsed &&
        typeof parsed === 'object' &&
        !url.includes('analytics')
      ) {
        const normalizedObj = { ...parsed };

        for (const key in normalizedObj) {
          if (Array.isArray(normalizedObj[key])) {
            normalizedObj[key] =
              normalizedObj[key].map(normalizeMovie);
          } else if (
            normalizedObj[key] &&
            typeof normalizedObj[key] === 'object' &&
            (
              normalizedObj[key].title ||
              normalizedObj[key].Title
            )
          ) {
            normalizedObj[key] =
              normalizeMovie(normalizedObj[key]);
          }
        }

        if (normalizedObj.similar_movies) {
          normalizedObj.similar_movies =
            normalizedObj.similar_movies.map(normalizeMovie);
        }

        return normalizedObj;
      }

      return parsed;

    } catch (e) {
      console.warn(
        'API returned invalid JSON:',
        text.substring(0, 200)
      );

      return url.includes('analytics')
        ? { stats: {}, charts: {} }
        : null;
    }

  } catch (err) {
    console.error('Network Error:', url, err);

    return url.includes('analytics')
      ? { stats: {}, charts: {} }
      : null;
  }
}

export const api = {

  async getMovies(limit = 20) {

    return await safeFetch(
      `${API_BASE_URL}/movies?limit=${limit}`
    );

  },

  async getPopularMovies(limit = 20) {

    return await safeFetch(
      `${API_BASE_URL}/movies/popular?limit=${limit}`
    );

  },

  async getTopRatedMovies(limit = 20) {

    return await safeFetch(
      `${API_BASE_URL}/movies/top-rated?limit=${limit}`
    );

  },

  async getExploreMovies(limit = 40) {

    return await safeFetch(
      `${API_BASE_URL}/movies/explore?limit=${limit}`
    );

  },

  async getHomeMovies(limit = 11) {

    return await safeFetch(
      `${API_BASE_URL}/movies/home?limit=${limit}`
    );

  },

  async getRecommendations(
    userId,
    topK = 11
  ) {

    return await safeFetch(
      `${API_BASE_URL}/recommend/${userId}?top_k=${topK}`
    );

  },

  async getSimilarMovies(
    movieId,
    topK = 11
  ) {

    return await safeFetch(
      `${API_BASE_URL}/similar/${movieId}?top_k=${topK}`
    );

  },

  async getExternalSimilarMovies(
    title,
    year = null,
    language = null,
    topK = 10
  ) {

    const params = new URLSearchParams();

    params.set(
      "title",
      title
    );

    params.set(
      "top_k",
      topK
    );

    if (year) {
      params.set(
        "year",
        year
      );
    }

    if (language) {
      params.set(
        "language",
        language
      );
    }

    return await safeFetch(
      `${API_BASE_URL}/similar/external?${params.toString()}`
    );

  },

  async searchMovies(
    query,
    limit = 11
  ) {

    return await safeFetch(
      `${API_BASE_URL}/movies/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );

  },

  async universalMovieSearch(query) {

    return await safeFetch(
      `${API_BASE_URL}/universal/search?q=${encodeURIComponent(query)}`
    );

  },

  async searchExternalMovies(
    query,
    page = 1
  ) {

    return await safeFetch(
      `${API_BASE_URL}/external/search?q=${encodeURIComponent(query)}&page=${page}`
    );

  },

  async getExternalMovieDetails(
    imdbId
  ) {

    return await safeFetch(
      `${API_BASE_URL}/external/movie/${encodeURIComponent(imdbId)}`
    );

  },

  async getAnalytics() {

    return await safeFetch(
      `${API_BASE_URL}/analytics`
    );

  },

  // ======================================================
  // MOVIEMIND GLOBAL CATALOGUE — 108K+ MOVIES
  // ======================================================

  async searchCatalogueMovies(
    query,
    limit = 20
  ) {

    return await safeFetch(
      `${API_BASE_URL}/api/catalogue/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );

  },

  async getCatalogueMovie(
    movieId
  ) {

    return await safeFetch(
      `${API_BASE_URL}/api/catalogue/movie/${movieId}`
    );

  },

  async getCatalogueSimilarMovies(
    movieId,
    limit = 12
  ) {

    return await safeFetch(
      `${API_BASE_URL}/api/catalogue/movie/${movieId}/similar?limit=${limit}`
    );

  },

  async getCatalogueStats() {

    return await safeFetch(
      `${API_BASE_URL}/api/catalogue/stats`
    );

  }

};
