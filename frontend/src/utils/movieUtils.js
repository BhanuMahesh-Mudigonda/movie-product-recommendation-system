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

export function resolveTrailerUrl(movieOrTrailer) {
  if (!movieOrTrailer) return null;

  const detectLanguage = (m) => {
    if (!m || typeof m !== 'object') return '';
    const raw = m.language || m.original_language || m.languageCode || m.originalLanguage || m.Language || '';
    const str = String(raw).trim().toLowerCase();
    if (str.includes('telugu') || str === 'te' || str === 'tel') return 'Telugu';
    if (str.includes('hindi') || str === 'hi' || str === 'hin') return 'Hindi';
    if (str.includes('tamil') || str === 'ta' || str === 'tam') return 'Tamil';
    if (str.includes('malayalam') || str === 'ml' || str === 'mal') return 'Malayalam';
    if (str.includes('kannada') || str === 'kn' || str === 'kan') return 'Kannada';
    if (str.includes('korean') || str === 'ko' || str === 'kor') return 'Korean';
    if (str.includes('japanese') || str === 'ja' || str === 'jpn') return 'Japanese';
    if (str.includes('english') || str === 'en' || str === 'eng') return 'English';
    return String(raw).trim();
  };

  let movieObj = typeof movieOrTrailer === 'object' ? movieOrTrailer : null;
  let candidate = null;

  if (typeof movieOrTrailer === 'string') {
    candidate = movieOrTrailer;
  } else if (movieObj) {
    const rawCandidates = [
      movieObj.url,
      movieObj.trailerUrl,
      movieObj.trailer_url,
      movieObj.youtubeUrl,
      movieObj.youtube_url,
      movieObj.youtubeTrailer,
      movieObj.key,
      movieObj.videoId,
      movieObj.video,
      movieObj.link
    ];

    if (movieObj.trailer) {
      if (typeof movieObj.trailer === 'string') {
        rawCandidates.unshift(movieObj.trailer);
      } else if (typeof movieObj.trailer === 'object' && movieObj.trailer !== null) {
        rawCandidates.unshift(
          movieObj.trailer.url,
          movieObj.trailer.trailerUrl,
          movieObj.trailer.youtubeUrl,
          movieObj.trailer.link,
          movieObj.trailer.key
        );
      }
    }

    candidate = rawCandidates.find(c => typeof c === 'string' && c.trim() !== '' && c !== 'N/A' && c !== 'null' && c !== 'undefined');
  }

  if (typeof candidate === 'string') {
    const trimmed = candidate.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) {
      return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return `https://www.youtube.com/watch?v=${trimmed}`;
    }
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      return `https://${trimmed.replace(/^https?:\/\//, '')}`;
    }
  }

  // Fallback: Language-aware YouTube search URL
  if (movieObj) {
    const title = movieObj.title || movieObj.Title || movieObj.name || movieObj.original_title || '';
    const year = movieObj.year || movieObj.Year || movieObj.release_year || '';
    const lang = detectLanguage(movieObj);

    if (title) {
      const searchTerms = [title, year, 'Official Trailer', lang].filter(Boolean).join(' ');
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`;
    }
  }

  return null;
}

function normalizeTrailer(movie) {
  const resolved = resolveTrailerUrl(movie);
  if (!resolved) {
    return {
      status: 'not_found',
      url: null,
      embedUrl: null
    };
  }

  const isSearchFallback = resolved.includes('youtube.com/results?search_query=');

  return {
    status: isSearchFallback ? 'search_fallback' : 'official',
    url: resolved,
    embedUrl: !isSearchFallback && (resolved.includes('youtube.com') || resolved.includes('youtu.be'))
      ? resolved
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
