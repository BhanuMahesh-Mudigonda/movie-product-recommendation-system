/**
 * MovieMind Universal Movie Normalizer
 * One stable movie structure for:
 * Local dataset + Search + Recommendations + Similar movies + External metadata
 */

const LANGUAGE_NAMES = {
  en: 'English',
  te: 'Telugu',
  hi: 'Hindi',
  ta: 'Tamil',
  ml: 'Malayalam',
  kn: 'Kannada',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
  pa: 'Punjabi',
  ur: 'Urdu',
  ko: 'Korean',
  ja: 'Japanese',
  zh: 'Chinese',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian'
};

export function getLanguageName(language) {
  if (!language) return '';

  const value = String(language).trim();
  const lower = value.toLowerCase();

  return LANGUAGE_NAMES[lower] || value;
}

export function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') {
    if (value.name) return String(value.name);
    if (value.title) return String(value.title);
    if (value.url) return String(value.url);
    return fallback;
  }
  return String(value);
}

export function safeGenres(genres) {
  if (!genres) return '';
  if (Array.isArray(genres)) {
    return genres
      .map(g => typeof g === 'object' ? (g.name || g.title || '') : String(g))
      .filter(Boolean)
      .join(' • ');
  }
  if (typeof genres === 'object') {
    return genres.name || genres.title || '';
  }
  return String(genres).replace(/\|/g, ',').split(',').map(g => g.trim()).filter(Boolean).join(' • ');
}

function normalizeGenres(movie) {
  const raw =
    movie?.genres ||
    movie?.genre ||
    movie?.Genre ||
    [];

  if (Array.isArray(raw)) {
    return raw
      .map(item => {
        if (typeof item === 'object') {
          return item?.name || item?.title || '';
        }
        return String(item);
      })
      .map(item => item.trim())
      .filter(Boolean);
  }

  return String(raw || '')
    .replace(/\|/g, ',')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeCast(movie) {
  const raw =
    movie?.cast ||
    movie?.Actors ||
    movie?.actors ||
    [];

  if (Array.isArray(raw)) {
    return raw
      .map(actor => {
        if (typeof actor === 'string') {
          return {
            name: actor.trim(),
            character: '',
            image: null
          };
        }

        let image =
          actor?.image ||
          actor?.profile ||
          actor?.profile_url ||
          null;

        if (!image && actor?.profile_path) {
          image = `https://image.tmdb.org/t/p/w185${actor.profile_path}`;
        }

        return {
          name:
            actor?.name ||
            actor?.original_name ||
            'Unknown',
          character:
            actor?.character ||
            '',
          image
        };
      })
      .filter(actor => actor.name);
  }

  if (typeof raw === 'string' && raw !== 'N/A') {
    return raw
      .split(',')
      .map(name => ({
        name: name.trim(),
        character: '',
        image: null
      }))
      .filter(actor => actor.name);
  }

  return [];
}

function normalizeTrailer(movie) {
  const raw =
    movie?.trailer ||
    movie?.trailerUrl ||
    movie?.trailer_url ||
    movie?.youtubeTrailer ||
    null;

  if (!raw) {
    return {
      status: 'not_found',
      url: null,
      embedUrl: null
    };
  }

  if (typeof raw === 'object') {
    const url =
      raw.url ||
      raw.link ||
      raw.trailerUrl ||
      null;

    return {
      status:
        raw.status ||
        (url ? 'found' : 'not_found'),

      url,

      embedUrl:
        raw.embedUrl ||
        raw.embed_url ||
        null
    };
  }

  const url = String(raw);

  return {
    status: 'found',
    url,
    embedUrl:
      url.includes('youtube.com') ||
      url.includes('youtu.be')
        ? url
        : null
  };
}

function normalizeBackdrop(movie, poster) {
  if (
    movie?.backdrop &&
    movie.backdrop !== 'N/A'
  ) {
    return movie.backdrop;
  }

  if (
    movie?.Backdrop &&
    movie.Backdrop !== 'N/A'
  ) {
    return movie.Backdrop;
  }

  if (
    movie?.backdrop_url &&
    movie.backdrop_url !== 'N/A'
  ) {
    return movie.backdrop_url;
  }

  if (
    movie?.backdropUrl &&
    movie.backdropUrl !== 'N/A'
  ) {
    return movie.backdropUrl;
  }

  const path =
    movie?.backdrop_path ||
    movie?.backdropPath;

  if (path) {
    if (String(path).startsWith('http')) {
      return path;
    }

    return `https://image.tmdb.org/t/p/original${path}`;
  }

  return poster || null;
}

export function normalizeMovie(movie) {
  if (!movie || typeof movie !== 'object') {
    return null;
  }

  const title =
    movie.title ||
    movie.Title ||
    movie.name ||
    movie.original_title ||
    'Unknown Movie';

  const movieId =
    movie.movieId ||
    movie.id ||
    movie.imdbID ||
    movie.imdb_id ||
    movie.tmdbId ||
    movie.tmdb_id ||
    `title_${String(title)
      .replace(/\s+/g, '_')
      .toLowerCase()}`;

  const poster =
    movie.poster ||
    movie.Poster ||
    movie.poster_url ||
    movie.posterUrl ||
    movie.image ||
    null;

  const backdrop =
    normalizeBackdrop(movie, poster);

  const languageCode =
    movie.language_code ||
    movie.original_language ||
    movie.language ||
    movie.Language ||
    '';

  const score =
    movie?.recommendation?.score ||
    movie.recommendationScore ||
    movie.score ||
    0;

  const reasons =
    movie?.recommendation?.reasons ||
    movie.reasons ||
    (movie.reason
      ? [movie.reason]
      : []);

  return {
    ...movie,

    movieId,

    imdbID:
      movie.imdbID ||
      movie.imdb_id ||
      '',

    tmdbId:
      movie.tmdbId ||
      movie.tmdb_id ||
      '',

    title,

    poster:
      poster && poster !== 'N/A'
        ? poster
        : null,

    backdrop,

    year:
      movie.year ||
      movie.Year ||
      movie.release_year ||
      movie.releaseDate?.slice(0, 4) ||
      movie.release_date?.slice(0, 4) ||
      '',

    rating:
      movie.rating ||
      movie.imdbRating ||
      movie.vote_average ||
      movie.avg_rating ||
      null,

    genres:
      normalizeGenres(movie),

    language:
      getLanguageName(languageCode),

    languageCode,

    cast:
      normalizeCast(movie),

    director:
      movie.director ||
      movie.Director ||
      '',

    overview:
      movie.overview ||
      movie.Plot ||
      movie.plot ||
      movie.description ||
      '',

    runtime:
      movie.runtime ||
      movie.Runtime ||
      '',

    trailer:
      normalizeTrailer(movie),

    whereToWatch:
      movie.whereToWatch ||
      [],

    isExternal:
      Boolean(movie.isExternal),

    recommendation: {
      score: Number(score) || 0,
      reasons: Array.isArray(reasons)
        ? reasons
        : [reasons].filter(Boolean)
    },

    recommendationScore:
      Number(score) || 0,

    reason:
      movie.reason ||
      movie.recommendationReason ||
      ''
  };
}
