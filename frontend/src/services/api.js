import { normalizeMovie } from '../utils/movieUtils';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';

const fetchOptions = {
  headers: {
    'Bypass-Tunnel-Reminder': 'true'
  }
};

async function safeFetch(url) {

  try {

    const res = await fetch(
      url,
      fetchOptions
    );

    const text = await res.text();

    try {

      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {

        return parsed.map(
          normalizeMovie
        );

      }

      if (
        parsed &&
        typeof parsed === 'object' &&
        !url.includes('analytics')
      ) {

        const normalizedObj = {
          ...parsed
        };

        for (const key in normalizedObj) {

          if (
            Array.isArray(
              normalizedObj[key]
            )
          ) {

            normalizedObj[key] =
              normalizedObj[key].map(
                normalizeMovie
              );

          }

          else if (
            normalizedObj[key] &&
            typeof normalizedObj[key] === 'object' &&
            !Array.isArray(
              normalizedObj[key]
            ) &&
            (
              normalizedObj[key].title ||
              normalizedObj[key].Title
            )
          ) {

            normalizedObj[key] =
              normalizeMovie(
                normalizedObj[key]
              );

          }

        }

        if (
          normalizedObj.similar_movies
        ) {

          normalizedObj.similar_movies =
            normalizedObj.similar_movies.map(
              normalizeMovie
            );

        }

        return normalizedObj;

      }

      return parsed;

    }

    catch (e) {

      console.warn(
        'API returned non-JSON:',
        text.substring(0, 100)
      );

      return url.includes('analytics')
        ? {
            stats: {},
            charts: {}
          }
        : [];

    }

  }

  catch (err) {

    console.error(
      'Network Error:',
      err
    );

    return url.includes('analytics')
      ? {
          stats: {},
          charts: {}
        }
      : [];

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

  }

};
