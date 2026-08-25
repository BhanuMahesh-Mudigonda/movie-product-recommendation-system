const BRAIN_KEY = 'moviemind_brain_v1';

const DEFAULT_BRAIN = {
  favourites: [],
  watchlist: [],
  history: [],
  searches: [],
  genreProfile: {},
  languageProfile: {},
  actorProfile: {},
  directorProfile: {},
  stats: {
    totalInteractions: 0,
    lastUpdated: null
  }
};

function loadBrain() {
  try {
    const saved = localStorage.getItem(BRAIN_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_BRAIN);
    }

    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(DEFAULT_BRAIN),
      ...(parsed && typeof parsed === 'object' ? parsed : {}),
      genreProfile: (parsed && parsed.genreProfile && typeof parsed.genreProfile === 'object') ? parsed.genreProfile : {},
      languageProfile: (parsed && parsed.languageProfile && typeof parsed.languageProfile === 'object') ? parsed.languageProfile : {},
      actorProfile: (parsed && parsed.actorProfile && typeof parsed.actorProfile === 'object') ? parsed.actorProfile : {},
      directorProfile: (parsed && parsed.directorProfile && typeof parsed.directorProfile === 'object') ? parsed.directorProfile : {}
    };
  } catch {
    return structuredClone(DEFAULT_BRAIN);
  }
}

function saveBrain(brain) {
  try {
    brain.stats = {
      ...brain.stats,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(
      BRAIN_KEY,
      JSON.stringify(brain)
    );
  } catch (error) {
    console.error('MovieMind Brain save failed:', error);
  }
}

function normalizeGenres(movie) {
  const raw =
    movie?.genres ||
    movie?.genre ||
    movie?.Genre ||
    [];

  if (Array.isArray(raw)) {
    return raw
      .map(item =>
        typeof item === 'object'
          ? item?.name
          : item
      )
      .filter(Boolean)
      .map(item => String(item).trim());
  }

  return String(raw || '')
    .replace(/\|/g, ',')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeActors(movie) {
  const raw =
    movie?.cast ||
    movie?.actors ||
    movie?.Actors ||
    [];

  if (Array.isArray(raw)) {
    return raw
      .map(actor =>
        typeof actor === 'string'
          ? actor
          : actor?.name
      )
      .filter(Boolean)
      .map(name => String(name).trim());
  }

  return String(raw || '')
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);
}

function addWeight(profile, value, weight) {
  if (!profile || typeof profile !== 'object' || !value) return;

  const key = String(value).trim();

  if (!key) return;

  profile[key] =
    (Number(profile[key]) || 0) +
    weight;
}

function applyMovieSignals(brain, movie, weight) {
  if (!movie) return;

  const genres = normalizeGenres(movie);

  genres.forEach(genre => {
    addWeight(
      brain.genreProfile,
      genre,
      weight
    );
  });

  const language =
    movie.language ||
    movie.languageCode ||
    movie.original_language;

  if (language) {
    addWeight(
      brain.languageProfile,
      language,
      weight
    );
  }

  const actors = normalizeActors(movie);

  actors.slice(0, 8).forEach(actor => {
    addWeight(
      brain.actorProfile,
      actor,
      weight * 0.6
    );
  });

  const director =
    movie.director ||
    movie.Director;

  if (director) {
    addWeight(
      brain.directorProfile,
      director,
      weight * 0.8
    );
  }
}

function pushUnique(list, movie, limit = 100) {
  const movieId =
    movie?.movieId ||
    movie?.id ||
    movie?.imdbID ||
    movie?.title;

  if (!movieId) return list;

  const filtered = list.filter(item => {
    const itemId =
      item?.movieId ||
      item?.id ||
      item?.imdbID ||
      item?.title;

    return String(itemId) !== String(movieId);
  });

  return [
    {
      ...movie,
      brainTimestamp: Date.now()
    },
    ...filtered
  ].slice(0, limit);
}

function getTopEntries(profile, limit = 5) {
  return Object.entries(profile || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, score]) => ({
      name,
      score: Number(score.toFixed(2))
    }));
}

export const movieMindBrain = {

  getProfile() {
    return loadBrain();
  },

  trackMovieOpen(movie) {
    const brain = loadBrain();

    brain.history = pushUnique(
      brain.history,
      movie,
      100
    );

    applyMovieSignals(
      brain,
      movie,
      1
    );

    brain.stats.totalInteractions += 1;

    saveBrain(brain);

    return brain;
  },

  trackFavourite(movie) {
    const brain = loadBrain();

    brain.favourites = pushUnique(
      brain.favourites,
      movie,
      100
    );

    applyMovieSignals(
      brain,
      movie,
      5
    );

    brain.stats.totalInteractions += 5;

    saveBrain(brain);

    return brain;
  },

  removeFavourite(movie) {
    const brain = loadBrain();

    const movieId =
      movie?.movieId ||
      movie?.id ||
      movie?.imdbID ||
      movie?.title;

    brain.favourites =
      brain.favourites.filter(item => {
        const itemId =
          item?.movieId ||
          item?.id ||
          item?.imdbID ||
          item?.title;

        return String(itemId) !== String(movieId);
      });

    saveBrain(brain);

    return brain;
  },

  trackWatchlist(movie) {
    const brain = loadBrain();

    brain.watchlist = pushUnique(
      brain.watchlist,
      movie,
      100
    );

    applyMovieSignals(
      brain,
      movie,
      3
    );

    brain.stats.totalInteractions += 3;

    saveBrain(brain);

    return brain;
  },

  trackSearch(query) {
    const cleanQuery =
      String(query || '').trim();

    if (!cleanQuery) return;

    const brain = loadBrain();

    brain.searches = [
      {
        query: cleanQuery,
        timestamp: Date.now()
      },
      ...brain.searches.filter(
        item =>
          item.query.toLowerCase() !==
          cleanQuery.toLowerCase()
      )
    ].slice(0, 50);

    brain.stats.totalInteractions += 1;

    saveBrain(brain);

    return brain;
  },

  getInsights() {
    const brain = loadBrain();

    return {
      favouriteCount:
        brain.favourites.length,

      watchlistCount:
        brain.watchlist.length,

      historyCount:
        brain.history.length,

      searchesCount:
        brain.searches.length,

      topGenres:
        getTopEntries(
          brain.genreProfile,
          6
        ),

      topLanguages:
        getTopEntries(
          brain.languageProfile,
          4
        ),

      topActors:
        getTopEntries(
          brain.actorProfile,
          5
        ),

      topDirectors:
        getTopEntries(
          brain.directorProfile,
          4
        ),

      totalInteractions:
        brain.stats.totalInteractions
    };
  },

  getRecommendationReason(movie) {
    if (!movie) {
      return 'Recommended based on MovieMind intelligence.';
    }

    const brain = loadBrain();

    const matches = [];

    const genres = normalizeGenres(movie);

    genres.forEach(genre => {
      const weight =
        brain.genreProfile[genre] || 0;

      if (weight > 0) {
        matches.push({
          type: 'genre',
          name: genre,
          weight
        });
      }
    });

    const language =
      movie.language ||
      movie.languageCode ||
      movie.original_language;

    if (
      language &&
      brain.languageProfile[language]
    ) {
      matches.push({
        type: 'language',
        name: language,
        weight:
          brain.languageProfile[language]
      });
    }

    const actors = normalizeActors(movie);

    actors.forEach(actor => {
      if (brain.actorProfile[actor]) {
        matches.push({
          type: 'actor',
          name: actor,
          weight:
            brain.actorProfile[actor]
        });
      }
    });

    matches.sort(
      (a, b) =>
        b.weight - a.weight
    );

    const top = matches.slice(0, 3);

    if (top.length === 0) {
      return 'Recommended based on your movie interactions and the existing MovieMind recommendation model.';
    }

    const labels =
      top.map(item => item.name);

    return `Recommended because your MovieMind profile strongly connects with ${labels.join(', ')}.`;
  },

  clearBrain() {
    localStorage.removeItem(BRAIN_KEY);
  }
};
