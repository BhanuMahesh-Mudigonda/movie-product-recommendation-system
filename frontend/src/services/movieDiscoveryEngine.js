import { movieMindRanker } from './movieMindRanker';
import { movieMindBrain } from './movieMindBrain';

const MOODS = {

  feel_good: {
    label: 'Feel Good',
    keywords: [
      'feel good',
      'happy',
      'fun',
      'funny',
      'light',
      'chill',
      'relax',
      'feelgood',
      'happy movie',
      'naku happy movie',
      'manchi feel good',
      'navvukovali',
      'saradaga'
    ],
    genres: ['Comedy', 'Family', 'Romance']
  },

  romantic: {
    label: 'Romantic',
    keywords: [
      'romantic',
      'romance',
      'love',
      'love story',
      'premakatha',
      'love movie',
      'prema',
      'love kavali',
      'romantic movie'
    ],
    genres: ['Romance', 'Drama']
  },

  adrenaline: {
    label: 'Adrenaline',
    keywords: [
      'action',
      'adrenaline',
      'thriller',
      'mass',
      'powerful',
      'high energy',
      'fight',
      'intense',
      'action movie',
      'mass movie'
    ],
    genres: ['Action', 'Thriller', 'Adventure']
  },

  dark: {
    label: 'Dark Mood',
    keywords: [
      'dark',
      'dark mood',
      'crime',
      'mystery',
      'suspense',
      'psychological',
      'serious',
      'investigation',
      'murder'
    ],
    genres: ['Thriller', 'Crime', 'Mystery']
  },

  emotional: {
    label: 'Emotional',
    keywords: [
      'emotional',
      'sad',
      'cry',
      'crying',
      'heart touching',
      'heartbreak',
      'deep',
      'meaningful',
      'emotion',
      'baadha',
      'edupu',
      'emotional movie',
      'heart touching movie',
      'naku emotional'
    ],
    genres: ['Drama', 'Romance']
  },

  epic: {
    label: 'Epic',
    keywords: [
      'epic',
      'grand',
      'big scale',
      'cinematic',
      'historical',
      'legendary',
      'powerful story',
      'war',
      'kingdom'
    ],
    genres: ['Action', 'Adventure', 'Drama']
  }

};


const LANGUAGES = {

  telugu: [
    'telugu',
    'tollywood',
    'తెలుగు',
    'telugu movie',
    'telugu cinema'
  ],

  hindi: [
    'hindi',
    'bollywood',
    'हिंदी',
    'hindi movie'
  ],

  tamil: [
    'tamil',
    'kollywood',
    'தமிழ்',
    'tamil movie'
  ],

  english: [
    'english',
    'hollywood',
    'english movie',
    'hollywood movie'
  ],

  malayalam: [
    'malayalam',
    'mollywood',
    'മലയാളം'
  ],

  kannada: [
    'kannada',
    'sandalwood',
    'ಕನ್ನಡ'
  ],

  korean: [
    'korean',
    'kdrama',
    'k movie',
    'korean movie'
  ],

  japanese: [
    'japanese',
    'anime',
    'japan movie'
  ]

};


const INTENT_KEYWORDS = {

  recommendation: [
    'recommend',
    'suggest',
    'kavali',
    'ivvu',
    'cheppu',
    'want',
    'need',
    'watch',
    'choose',
    'best movie',
    'movie kavali'
  ],

  search: [
    'search',
    'find',
    'show',
    'movie',
    'actor',
    'director'
  ]

};


function normalize(text) {

  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

}


function includesKeyword(text, keywords) {

  return keywords.some(keyword =>
    text.includes(
      normalize(keyword)
    )
  );

}


function detectMood(text) {

  const detected = [];

  Object.entries(MOODS).forEach(
    ([key, mood]) => {

      if (
        includesKeyword(
          text,
          mood.keywords
        )
      ) {

        detected.push({
          key,
          label: mood.label,
          genres: mood.genres
        });

      }

    }
  );

  return detected;

}


function detectLanguage(text) {

  for (
    const [language, keywords]
    of Object.entries(LANGUAGES)
  ) {

    if (
      includesKeyword(
        text,
        keywords
      )
    ) {

      return language;

    }

  }

  return null;

}


function detectIntent(text) {

  for (
    const [intent, keywords]
    of Object.entries(INTENT_KEYWORDS)
  ) {

    if (
      includesKeyword(
        text,
        keywords
      )
    ) {

      return intent;

    }

  }

  return 'discovery';

}


function extractGenres(moods) {

  const genres = new Set();

  moods.forEach(mood => {

    mood.genres.forEach(
      genre => genres.add(genre)
    );

  });

  return [...genres];

}


function getSearchQueries(
  originalQuery,
  intelligence
) {

  const queries = [];

  queries.push(originalQuery);

  intelligence.moods.forEach(mood => {

    mood.genres.forEach(genre => {

      if (
        intelligence.language
      ) {

        queries.push(
          `${intelligence.language} ${genre} movie`
        );

      }

      queries.push(
        `${genre} movie`
      );

    });

  });

  return [
    ...new Set(queries)
  ].slice(0, 8);

}


function movieGenres(movie) {

  const raw =
    movie.genres ||
    movie.genre ||
    '';

  if (
    Array.isArray(raw)
  ) {

    return raw.map(item =>
      String(
        typeof item === 'object'
          ? item.name
          : item
      ).toLowerCase()
    );

  }

  return String(raw)
    .replace(/\|/g, ',')
    .split(',')
    .map(item =>
      item.trim().toLowerCase()
    )
    .filter(Boolean);

}


function applyDiscoveryScore(
  movie,
  intelligence
) {

  let score = 0;

  const reasons = [];

  const genres =
    movieGenres(movie);

  intelligence.genres.forEach(
    targetGenre => {

      if (
        genres.some(
          genre =>
            genre.includes(
              targetGenre.toLowerCase()
            )
        )
      ) {

        score += 25;

        reasons.push(
          `${targetGenre} matches your mood`
        );

      }

    }
  );


  if (
    intelligence.language
  ) {

    const movieLanguage =
      String(
        movie.language ||
        movie.languageCode ||
        movie.original_language ||
        ''
      ).toLowerCase();

    if (
      movieLanguage.includes(
        intelligence.language
      )
    ) {

      score += 20;

      reasons.push(
        `${intelligence.language} language match`
      );

    }

  }


  return {
    discoveryScore:
      Math.min(score, 50),

    discoveryReasons:
      reasons.slice(0, 3)
  };

}


export const movieDiscoveryEngine = {

  understand(query) {

    const cleanQuery =
      normalize(query);

    const moods =
      detectMood(cleanQuery);

    const language =
      detectLanguage(cleanQuery);

    const intent =
      detectIntent(cleanQuery);

    const genres =
      extractGenres(moods);

    const intelligence = {

      originalQuery:
        String(query || '').trim(),

      intent,

      moods,

      language,

      genres,

      confidence:
        Math.min(
          0.4 +
          moods.length * 0.2 +
          (language ? 0.2 : 0),
          0.95
        )

    };

    intelligence.searchQueries =
      getSearchQueries(
        intelligence.originalQuery,
        intelligence
      );

    return intelligence;

  },


  async discover(
    query,
    searchFunction
  ) {

    const intelligence =
      this.understand(query);

    movieMindBrain.trackSearch(query);

    const collectedMovies = [];

    for (
      const searchQuery
      of intelligence.searchQueries
    ) {

      try {

        const results =
          await searchFunction(searchQuery);

        if (
          Array.isArray(results)
        ) {

          collectedMovies.push(
            ...results
          );

        }

      } catch (error) {

        console.error(
          'Discovery search failed:',
          searchQuery,
          error
        );

      }

    }


    const uniqueMovies =
      Array.from(
        new Map(
          collectedMovies.map(movie => {

            const id =
              movie.movieId ||
              movie.moviemind_id ||
              movie.id ||
              movie.title;

            return [
              String(id),
              movie
            ];

          })
        ).values()
      );


    const enriched =
      uniqueMovies.map(movie => {

        const discovery =
          applyDiscoveryScore(
            movie,
            intelligence
          );

        return {
          ...movie,
          ...discovery
        };

      });


    const ranked =
      movieMindRanker.rankMovies(
        enriched
      );


    const finalMovies =
      ranked
        .map(movie => {

          const finalScore =
            Math.min(
              100,

              (
                movie.movieMindScore || 0
              ) * 0.5 +

              (
                movie.discoveryScore || 0
              ) +

              (
                Number(
                  movie.rating || 0
                ) * 2
              )
            );

          return {
            ...movie,

            movieMindScore:
              Math.round(finalScore),

            discoveryReasons:
              movie.discoveryReasons ||
              []
          };

        })
        .sort(
          (a, b) =>
            b.movieMindScore -
            a.movieMindScore
        );


    return {

      intelligence,

      movies:
        finalMovies

    };

  }

};
