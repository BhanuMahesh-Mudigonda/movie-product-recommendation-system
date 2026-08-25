import { movieMindBrain } from './movieMindBrain';

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
      .map(item =>
        String(item).trim().toLowerCase()
      );
  }

  return String(raw || '')
    .replace(/\|/g, ',')
    .split(',')
    .map(item =>
      item.trim().toLowerCase()
    )
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
      .map(name =>
        String(name).trim().toLowerCase()
      );
  }

  return String(raw || '')
    .split(',')
    .map(name =>
      name.trim().toLowerCase()
    )
    .filter(Boolean);
}

function findWeight(profile, value) {
  if (!profile || !value) return 0;

  const target =
    String(value).trim().toLowerCase();

  const entry =
    Object.entries(profile).find(
      ([key]) =>
        String(key)
          .trim()
          .toLowerCase() === target
    );

  return entry
    ? Number(entry[1]) || 0
    : 0;
}

export const movieMindRanker = {

  scoreMovie(movie) {
    if (!movie) {
      return {
        score: 0,
        reasons: []
      };
    }

    const brain =
      movieMindBrain.getProfile();

    let totalScore = 0;

    const reasons = [];

    const genres =
      normalizeGenres(movie);

    genres.forEach(genre => {
      const weight =
        findWeight(
          brain.genreProfile,
          genre
        );

      if (weight > 0) {
        totalScore +=
          Math.min(weight * 4, 30);

        reasons.push({
          type: 'genre',
          name: genre,
          strength: weight
        });
      }
    });

    const language =
      movie.languageCode ||
      movie.original_language ||
      movie.language ||
      '';

    const languageWeight =
      findWeight(
        brain.languageProfile,
        language
      );

    if (languageWeight > 0) {
      totalScore +=
        Math.min(
          languageWeight * 3,
          15
        );

      reasons.push({
        type: 'language',
        name: language,
        strength: languageWeight
      });
    }

    const actors =
      normalizeActors(movie);

    actors.slice(0, 10).forEach(actor => {
      const weight =
        findWeight(
          brain.actorProfile,
          actor
        );

      if (weight > 0) {
        totalScore +=
          Math.min(weight * 2, 10);

        reasons.push({
          type: 'actor',
          name: actor,
          strength: weight
        });
      }
    });

    const director =
      movie.director ||
      movie.Director ||
      '';

    const directorWeight =
      findWeight(
        brain.directorProfile,
        director
      );

    if (directorWeight > 0) {
      totalScore +=
        Math.min(
          directorWeight * 3,
          15
        );

      reasons.push({
        type: 'director',
        name: director,
        strength: directorWeight
      });
    }

    const existingScore =
      Number(
        movie.recommendationScore ||
        movie.score ||
        movie.recommendation?.score ||
        0
      );

    if (existingScore > 0) {
      const normalizedExisting =
        existingScore <= 1
          ? existingScore * 30
          : existingScore * 0.3;

      totalScore +=
        Math.min(
          normalizedExisting,
          30
        );
    }

    totalScore =
      Math.min(
        Math.max(
          Math.round(totalScore),
          0
        ),
        100
      );

    reasons.sort(
      (a, b) =>
        b.strength - a.strength
    );

    return {
      score: totalScore,
      reasons:
        reasons.slice(0, 3)
    };
  },

  rankMovies(movies = [], searchIntent = null) {
    return [...movies]
      .map(movie => {
        const intelligence =
          this.scoreMovie(movie);

        const reasonNames =
          intelligence.reasons.map(
            item => item.name
          );

        let reason =
          'Recommended by the MovieMind recommendation system.';

        if (reasonNames.length > 0) {
          reason =
            `Matches your MovieMind profile through ${reasonNames.join(', ')}.`;
        }

        let totalScore = intelligence.score;
        let searchRelevanceBoost = 0;
        let discoveryExplicitBoost = 0;

        if (searchIntent) {
          const query = String(searchIntent.query || '').toLowerCase().trim();
          const title = String(movie.title || '').toLowerCase().trim();
          const originalTitle = String(movie.original_title || '').toLowerCase().trim();
          
          if (query) {
            if (title === query || originalTitle === query) {
              searchRelevanceBoost += 500;
              reason = 'Exact match for your search.';
            } else if (title.startsWith(query) || originalTitle.startsWith(query)) {
              searchRelevanceBoost += 200;
              reason = 'Strong match for your search.';
            } else if (title.includes(query) || originalTitle.includes(query)) {
              searchRelevanceBoost += 50;
            }
          }

          if (searchIntent.filters) {
            const filters = searchIntent.filters;
            
            // 1. Language Boost (+60)
            if (filters.language && filters.language !== 'Any Language') {
              const mLang = String(movie.language || movie.languageCode || '').toLowerCase();
              if (mLang.includes(filters.language.toLowerCase())) {
                discoveryExplicitBoost += 60;
              }
            }

            // 2. Selected Genres Boost (+50 / +40)
            if (filters.genres && Array.isArray(filters.genres) && filters.genres.length > 0) {
              const mGenres = normalizeGenres(movie);
              let genreMatchCount = 0;
              filters.genres.forEach(g => {
                const lowerG = String(g).toLowerCase().trim();
                if (mGenres.some(mg => mg.includes(lowerG) || lowerG.includes(mg))) {
                  genreMatchCount++;
                }
              });
              if (genreMatchCount > 0) {
                discoveryExplicitBoost += (genreMatchCount === 1 ? 50 : 50 + (genreMatchCount - 1) * 40);
                reason = `Matches your selected taste in ${filters.genres.join(', ')}.`;
              }
            }

            // 3. Mood Semantic Mapping Boost (+30)
            const moodSemanticMap = {
              excited: ['action', 'thriller', 'adventure', 'crime', 'sci-fi'],
              romantic: ['romance', 'drama', 'family'],
              happy: ['comedy', 'family', 'adventure', 'animation'],
              dark: ['crime', 'mystery', 'thriller', 'horror'],
              emotional: ['drama', 'romance', 'family'],
              epic: ['adventure', 'fantasy', 'action', 'sci-fi']
            };

            if (filters.mood && moodSemanticMap[filters.mood]) {
              const mGenres = normalizeGenres(movie);
              const semanticList = moodSemanticMap[filters.mood];
              if (mGenres.some(g => semanticList.includes(g))) {
                discoveryExplicitBoost += 30;
                if (!reason || reason.includes('MovieMind profile')) {
                  reason = 'Recommended based on your current mood and style.';
                }
              }
            }

            // 4. Era Boost (+15)
            if (filters.era && filters.era !== 'Surprise Me') {
              const yr = parseInt(movie.year);
              if (!isNaN(yr)) {
                if (filters.era === 'Latest Available' && yr >= 2020) discoveryExplicitBoost += 15;
                if (filters.era === 'Modern Favorites' && yr >= 2010 && yr < 2020) discoveryExplicitBoost += 15;
                if (filters.era === 'Classic Favorites' && yr < 2010) discoveryExplicitBoost += 15;
              }
            }

            if (filters.time && filters.time !== 'Standard') {
              const runStr = String(movie.runtime || '').toLowerCase();
              let mins = 0;
              if (runStr.includes('h')) {
                const hMatch = runStr.match(/(\d+)\s*h/);
                const mMatch = runStr.match(/(\d+)\s*m/);
                mins = (parseInt(hMatch?.[1] || 0) * 60) + parseInt(mMatch?.[1] || 0);
              } else {
                const minMatch = runStr.match(/(\d+)/);
                if (minMatch) mins = parseInt(minMatch[1]);
              }
              if (mins > 0) {
                if (filters.time === 'Quick Watch' && mins < 120) discoveryExplicitBoost += 30;
                if (filters.time === 'Long Movie' && mins >= 140) discoveryExplicitBoost += 30;
              }
            }
          }
        }

        const finalScore = totalScore + searchRelevanceBoost + discoveryExplicitBoost;

        return {
          ...movie,

          movieMindScore:
            finalScore,
            
          baseMovieMindScore:
            totalScore,

          recommendationScore:
            Math.max(
              Number(
                movie.recommendationScore ||
                movie.score ||
                0
              ),
              totalScore / 100
            ),

          brainReasons:
            intelligence.reasons,

          reason:
            movie.reason ||
            movie.recommendationReason ||
            reason
        };
      })
      .sort(
        (a, b) =>
          b.movieMindScore -
          a.movieMindScore
      );
  }
};
