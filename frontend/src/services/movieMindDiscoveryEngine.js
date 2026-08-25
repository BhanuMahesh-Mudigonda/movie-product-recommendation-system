import { movieMindBrain } from './movieMindBrain';
import { movieMindRanker } from './movieMindRanker';

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
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
      .map(item => normalizeText(item));
  }

  return String(raw || '')
    .replace(/\|/g, ',')
    .split(',')
    .map(item => normalizeText(item))
    .filter(Boolean);
}

function getLanguage(movie) {
  return normalizeText(
    movie?.languageCode ||
    movie?.original_language ||
    movie?.language ||
    ''
  );
}

const LANGUAGE_ALIASES = {

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
    'हिन्दी',
    'hindi movie'
  ],

  tamil: [
    'tamil',
    'kollywood',
    'தமிழ்',
    'tamil movie'
  ],

  malayalam: [
    'malayalam',
    'mollywood',
    'മലയാളം',
    'malayalam movie'
  ],

  kannada: [
    'kannada',
    'sandalwood',
    'ಕನ್ನಡ',
    'kannada movie'
  ],

  english: [
    'english',
    'hollywood',
    'english movie'
  ],

  korean: [
    'korean',
    'korea',
    'korean movie',
    'k drama',
    'kdrama'
  ],

  japanese: [
    'japanese',
    'japan',
    'anime',
    'japanese movie'
  ]

};

const LANGUAGE_CODES = {

  telugu: [
    'te',
    'telugu'
  ],

  hindi: [
    'hi',
    'hindi'
  ],

  tamil: [
    'ta',
    'tamil'
  ],

  malayalam: [
    'ml',
    'malayalam'
  ],

  kannada: [
    'kn',
    'kannada'
  ],

  english: [
    'en',
    'english'
  ],

  korean: [
    'ko',
    'korean'
  ],

  japanese: [
    'ja',
    'japanese'
  ]

};

const MOOD_SIGNALS = {

  happy: {
    keywords: [
      'happy',
      'fun',
      'funny',
      'comedy',
      'feel good',
      'light',
      'navvali',
      'navvu',
      'fun movie',
      'sarada'
    ],
    genres: [
      'comedy',
      'family'
    ]
  },

  romantic: {
    keywords: [
      'romantic',
      'romance',
      'love',
      'relationship',
      'love story',
      'premakatha',
      'prema',
      'love movie',
      'romantic movie'
    ],
    genres: [
      'romance',
      'drama'
    ]
  },

  excited: {
    keywords: [
      'action',
      'thriller',
      'excited',
      'adrenaline',
      'fight',
      'mass',
      'high voltage',
      'fast paced'
    ],
    genres: [
      'action',
      'thriller',
      'adventure'
    ]
  },

  dark: {
    keywords: [
      'dark',
      'crime',
      'mystery',
      'suspense',
      'psychological',
      'serial killer',
      'investigation',
      'twist'
    ],
    genres: [
      'crime',
      'mystery',
      'thriller',
      'horror'
    ]
  },

  emotional: {
    keywords: [
      'emotional',
      'sad',
      'meaningful',
      'heart touching',
      'heartwarming',
      'feel emotional',
      'edavalanipinche',
      'emotion'
    ],
    genres: [
      'drama',
      'family'
    ]
  },

  epic: {
    keywords: [
      'epic',
      'blockbuster',
      'cinematic',
      'grand',
      'spectacle',
      'big movie',
      'visual',
      'larger than life'
    ],
    genres: [
      'action',
      'adventure',
      'fantasy',
      'science fiction'
    ]
  },

  horror: {
    keywords: [
      'horror',
      'scary',
      'ghost',
      'bhayam',
      'bayam',
      'haunted',
      'terror'
    ],
    genres: [
      'horror',
      'thriller',
      'mystery'
    ]
  }

};

function detectLanguage(query = '') {
  const text = normalizeText(query);

  for (
    const [language, aliases]
    of Object.entries(LANGUAGE_ALIASES)
  ) {
    if (
      aliases.some(alias =>
        text.includes(alias)
      )
    ) {
      return language;
    }
  }

  return null;
}

function detectMood(query = '') {
  const text = normalizeText(query);

  let bestMood = null;
  let highestScore = 0;

  for (
    const [mood, config]
    of Object.entries(MOOD_SIGNALS)
  ) {

    const score =
      config.keywords.reduce(
        (total, keyword) =>
          text.includes(keyword)
            ? total + 1
            : total,
        0
      );

    if (score > highestScore) {
      highestScore = score;
      bestMood = mood;
    }

  }

  return bestMood;
}

function getDetectedIntent(query = '') {

  const text =
    normalizeText(query);

  const detectedLanguage =
    detectLanguage(text);

  const detectedMood =
    detectMood(text);

  return {
    query: text,
    language: detectedLanguage,
    mood: detectedMood
  };

}

function languageMatches(
  movieLanguage,
  detectedLanguage
) {

  if (!detectedLanguage) {
    return false;
  }

  const normalizedMovieLanguage =
    normalizeText(movieLanguage);

  const aliases =
    LANGUAGE_CODES[detectedLanguage] ||
    [];

  return aliases.some(alias =>
    normalizedMovieLanguage === alias ||
    normalizedMovieLanguage.includes(alias)
  );

}

function calculateQueryScore(
  movie,
  query,
  detectedMood,
  detectedLanguage
) {

  let score = 0;

  const text =
    normalizeText(query);

  const title =
    normalizeText(movie?.title);

  const overview =
    normalizeText(
      movie?.overview ||
      movie?.description ||
      movie?.plot ||
      ''
    );

  const genres =
    normalizeGenres(movie);

  const language =
    getLanguage(movie);

  const reasons = [];

  /*
    TITLE MATCH
  */

  if (
    title &&
    text &&
    title === text
  ) {

    score += 60;

    reasons.push(
      'Exact title match'
    );

  } else if (
    title &&
    text &&
    (
      title.includes(text) ||
      text.includes(title)
    )
  ) {

    score += 40;

    reasons.push(
      'Title match'
    );

  }

  /*
    KEYWORD MATCH
  */

  const queryWords =
    text
      .split(' ')
      .filter(word =>
        word.length >= 3
      );

  const matchedWords =
    queryWords.filter(word =>
      title.includes(word) ||
      overview.includes(word)
    );

  if (matchedWords.length > 0) {

    score +=
      Math.min(
        matchedWords.length * 5,
        20
      );

    reasons.push(
      'Query relevance'
    );

  }

  /*
    MOOD MATCH
  */

  if (
    detectedMood &&
    MOOD_SIGNALS[detectedMood]
  ) {

    const moodGenres =
      MOOD_SIGNALS[
        detectedMood
      ].genres;

    const matchedGenres =
      genres.filter(genre =>
        moodGenres.includes(genre)
      );

    if (matchedGenres.length > 0) {

      score +=
        Math.min(
          matchedGenres.length * 12,
          28
        );

      reasons.push(
        `${detectedMood} mood match`
      );

    }

  }

  /*
    LANGUAGE MATCH
  */

  if (
    detectedLanguage &&
    languageMatches(
      language,
      detectedLanguage
    )
  ) {

    score += 30;

    reasons.push(
      `${detectedLanguage} language match`
    );

  }

  return {
    score,
    reasons
  };

}

export const movieMindDiscoveryEngine = {

  discover(query, movies = []) {

    const safeMovies =
      Array.isArray(movies)
        ? movies
        : [];

    const intelligence =
      movieMindBrain.getProfile();

    /*
      STEP 1
      Understand user intention
    */

    const intent =
      getDetectedIntent(query);

    /*
      STEP 2
      Existing personalized ranking
    */

    const rankedMovies =
      movieMindRanker.rankMovies(
        safeMovies
      );

    /*
      STEP 3
      Discovery scoring
    */

    const finalMovies =
      rankedMovies
        .map(movie => {

          const queryMatch =
            calculateQueryScore(
              movie,
              intent.query,
              intent.mood,
              intent.language
            );

          const rating =
            Number(
              movie?.rating ||
              movie?.vote_average ||
              0
            );

          const brainScore =
            Number(
              movie?.movieMindScore ||
              0
            );

          const discoveryScore =
            queryMatch.score +
            (brainScore * 0.45) +
            Math.min(
              rating * 2,
              20
            );

          return {

            ...movie,

            movieMindScore:
              Math.min(
                100,
                Math.round(
                  discoveryScore
                )
              ),

            discoveryScore:
              Math.round(
                discoveryScore
              ),

            discoveryReasons: [
              ...queryMatch.reasons,
              ...(movie?.brainReasons || [])
                .map(item =>
                  item?.name ||
                  item
                )
            ]
              .filter(Boolean)
              .filter(
                (item, index, array) =>
                  array.indexOf(item) ===
                  index
              )
              .slice(0, 5)

          };

        })
        .sort(
          (a, b) =>
            b.discoveryScore -
            a.discoveryScore
        );

    return {

      intelligence,

      detectedMood:
        intent.mood,

      detectedLanguage:
        intent.language,

      movies:
        finalMovies

    };

  }

};
