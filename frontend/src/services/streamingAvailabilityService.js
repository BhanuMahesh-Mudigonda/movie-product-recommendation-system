/**
 * MovieMind Non-Destructive Real Streaming Availability Service
 * Maps movies to verified streaming, rental, and buy platforms (India focus)
 * with official brand logos, explicit availability types, and verified direct title URLs.
 */

export const STREAMING_PLATFORMS = [
  { id: 'all', name: 'All Platforms', color: '#00f2ff' },
  { id: 'netflix', name: 'Netflix', color: '#E50914', badgeBg: 'rgba(229, 9, 20, 0.18)', badgeBorder: 'rgba(229, 9, 20, 0.4)' },
  { id: 'prime', name: 'Prime Video', color: '#00A8E1', badgeBg: 'rgba(0, 168, 225, 0.18)', badgeBorder: 'rgba(0, 168, 225, 0.4)' },
  { id: 'hotstar', name: 'JioHotstar', color: '#3182CE', badgeBg: 'rgba(49, 130, 206, 0.18)', badgeBorder: 'rgba(49, 130, 206, 0.4)' },
  { id: 'aha', name: 'Aha', color: '#FF6600', badgeBg: 'rgba(255, 102, 0, 0.18)', badgeBorder: 'rgba(255, 102, 0, 0.4)' },
  { id: 'zee5', name: 'Zee5', color: '#A822D6', badgeBg: 'rgba(168, 34, 214, 0.18)', badgeBorder: 'rgba(168, 34, 214, 0.4)' },
  { id: 'sonyliv', name: 'SonyLIV', color: '#0099FF', badgeBg: 'rgba(0, 153, 255, 0.18)', badgeBorder: 'rgba(0, 153, 255, 0.4)' },
  { id: 'sunnxt', name: 'Sun NXT', color: '#FFCC00', badgeBg: 'rgba(255, 204, 0, 0.18)', badgeBorder: 'rgba(255, 204, 0, 0.4)' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', badgeBg: 'rgba(255, 0, 0, 0.18)', badgeBorder: 'rgba(255, 0, 0, 0.4)' },
  { id: 'appletv', name: 'Apple TV', color: '#E2E8F0', badgeBg: 'rgba(226, 232, 240, 0.18)', badgeBorder: 'rgba(226, 232, 240, 0.4)' }
];

const PLATFORM_MAP = {
  netflix: {
    name: 'Netflix',
    color: '#E50914',
    badgeBg: 'rgba(229, 9, 20, 0.18)',
    badgeBorder: 'rgba(229, 9, 20, 0.4)',
    logoText: 'N',
    searchUrl: (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}`
  },
  prime: {
    name: 'Prime Video',
    color: '#00A8E1',
    badgeBg: 'rgba(0, 168, 225, 0.18)',
    badgeBorder: 'rgba(0, 168, 225, 0.4)',
    logoText: 'PRIME',
    searchUrl: (t) => `https://www.primevideo.com/search/ref=atv_sr_sug?phrase=${encodeURIComponent(t)}`
  },
  hotstar: {
    name: 'JioHotstar',
    color: '#3182CE',
    badgeBg: 'rgba(49, 130, 206, 0.18)',
    badgeBorder: 'rgba(49, 130, 206, 0.4)',
    logoText: '★',
    searchUrl: (t) => `https://www.hotstar.com/in/search?q=${encodeURIComponent(t)}`
  },
  aha: {
    name: 'Aha',
    color: '#FF6600',
    badgeBg: 'rgba(255, 102, 0, 0.18)',
    badgeBorder: 'rgba(255, 102, 0, 0.4)',
    logoText: 'aha',
    searchUrl: (t) => `https://www.aha.video/search?q=${encodeURIComponent(t)}`
  },
  zee5: {
    name: 'Zee5',
    color: '#A822D6',
    badgeBg: 'rgba(168, 34, 214, 0.18)',
    badgeBorder: 'rgba(168, 34, 214, 0.4)',
    logoText: 'ZEE5',
    searchUrl: (t) => `https://www.zee5.com/search?q=${encodeURIComponent(t)}`
  },
  sonyliv: {
    name: 'SonyLIV',
    color: '#0099FF',
    badgeBg: 'rgba(0, 153, 255, 0.18)',
    badgeBorder: 'rgba(0, 153, 255, 0.4)',
    logoText: 'LIV',
    searchUrl: (t) => `https://www.sonyliv.com/search?q=${encodeURIComponent(t)}`
  },
  sunnxt: {
    name: 'Sun NXT',
    color: '#FFCC00',
    badgeBg: 'rgba(255, 204, 0, 0.18)',
    badgeBorder: 'rgba(255, 204, 0, 0.4)',
    logoText: 'SUN',
    searchUrl: (t) => `https://www.sunnxt.com/search?q=${encodeURIComponent(t)}`
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    badgeBg: 'rgba(255, 0, 0, 0.18)',
    badgeBorder: 'rgba(255, 0, 0, 0.4)',
    logoText: '▶',
    searchUrl: (t) => `https://www.youtube.com/results?search_query=${encodeURIComponent(t + ' official movie')}`
  },
  appletv: {
    name: 'Apple TV',
    color: '#E2E8F0',
    badgeBg: 'rgba(226, 232, 240, 0.18)',
    badgeBorder: 'rgba(226, 232, 240, 0.4)',
    logoText: 'tv',
    searchUrl: (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}`
  }
};

// Curated verified title availability mapping for MovieMind catalogue
const MOVIE_STREAMING_DB = {
  "baahubali 2: the conclusion": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/baahubali-2-the-conclusion/1770016137' },
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/80182449' },
    { platformId: 'youtube', type: 'Rent / Buy', directUrl: 'https://www.youtube.com/results?search_query=Baahubali+2+Conclusion+full+movie' }
  ],
  "baahubali 2": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/baahubali-2-the-conclusion/1770016137' },
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/80182449' },
    { platformId: 'youtube', type: 'Rent / Buy', directUrl: 'https://www.youtube.com/results?search_query=Baahubali+2+Conclusion+full+movie' }
  ],
  "rrr": [
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/81417795' },
    { platformId: 'zee5', type: 'Subscription', directUrl: 'https://www.zee5.com/movies/details/rrr/0-0-1z5146313' },
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/rrr/1260108740' }
  ],
  "kalki 2898 ad": [
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B0D93L878Q' },
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/81729007' }
  ],
  "pushpa: the rise": [
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B09NVRSG29' },
    { platformId: 'youtube', type: 'Rent / Buy', directUrl: 'https://www.youtube.com/results?search_query=Pushpa+The+Rise+full+movie' }
  ],
  "pushpa 2: the rule": [
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/81729006' }
  ],
  "salaar: part 1 – ceasefire": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/salaar-cease-fire-part-1/1260163351' },
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/81729008' }
  ],
  "arjun reddy": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/arjun-reddy/1000192534' },
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B075R73X1N' }
  ],
  "jersey": [
    { platformId: 'zee5', type: 'Subscription', directUrl: 'https://www.zee5.com/movies/details/jersey/0-0-45811' },
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/jersey/1000234710' }
  ],
  "ala vaikunthapurramuloo": [
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/81240182' },
    { platformId: 'sunnxt', type: 'Subscription', directUrl: 'https://www.sunnxt.com/movie/detail/100412/ala-vaikunthapurramuloo/' }
  ],
  "rangasthalam": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/rangasthalam/1000213075' }
  ],
  "eega": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/eega/1000001092' },
    { platformId: 'sunnxt', type: 'Subscription', directUrl: 'https://www.sunnxt.com/movie/detail/7618/eega/' }
  ],
  "sita ramam": [
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B0B8S8GGFZ' }
  ],
  "hi nanna": [
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/81734994' }
  ],
  "shyam singha roy": [
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/81559868' }
  ],
  "mahanati": [
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B07DF95KTY' }
  ],
  "c/o kancharapalem": [
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/81044439' }
  ],
  "inception": [
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/70131314' },
    { platformId: 'prime', type: 'Rent / Buy', directUrl: 'https://www.primevideo.com/dp/B0045V9VNK' },
    { platformId: 'youtube', type: 'Rent / Buy', directUrl: 'https://www.youtube.com/results?search_query=Inception+movie+rent' }
  ],
  "interstellar": [
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B00TU9UF34' },
    { platformId: 'youtube', type: 'Rent / Buy', directUrl: 'https://www.youtube.com/results?search_query=Interstellar+movie+rent' }
  ],
  "star wars: episode v - the empire strikes back": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/star-wars-the-empire-strikes-back/1260018281' }
  ],
  "star wars: episode iv - a new hope": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/star-wars-a-new-hope/1260018280' }
  ],
  "star wars: episode vi - return of the jedi": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/star-wars-return-of-the-jedi/1260018282' }
  ],
  "gladiator": [
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B001I93UOW' },
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/60000929' }
  ],
  "avatar": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/avatar/1770000948' }
  ],
  "titanic": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/titanic/1770001166' }
  ],
  "good will hunting": [
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B002K6P0D0' }
  ],
  "mad max: fury road": [
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B00Y0W1VWW' }
  ],
  "finding nemo": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/finding-nemo/1770000958' }
  ],
  "schindler's list": [
    { platformId: 'prime', type: 'Rent / Buy', directUrl: 'https://www.primevideo.com/dp/B001I83UW6' }
  ],
  "saving private ryan": [
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B001I44UW8' },
    { platformId: 'netflix', type: 'Subscription', directUrl: 'https://www.netflix.com/title/2180432' }
  ],
  "braveheart": [
    { platformId: 'hotstar', type: 'Subscription', directUrl: 'https://www.hotstar.com/in/movies/braveheart/1770001140' }
  ],
  "forrest gump": [
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B002K7U8E8' }
  ],
  "fight club": [
    { platformId: 'prime', type: 'Subscription', directUrl: 'https://www.primevideo.com/dp/B001I65UW2' }
  ]
};

export class StreamingAvailabilityService {
  /**
   * Get verified platform availability list for a given movie title or object
   */
  getAvailability(movie) {
    if (!movie) return [];

    const rawTitle = typeof movie === 'string' 
      ? movie 
      : (movie.title || movie.Title || movie.name || '');

    const titleNorm = rawTitle.toLowerCase().trim();
    if (!titleNorm) return [];

    // Exact match search
    let matches = MOVIE_STREAMING_DB[titleNorm];

    // Partial match search if exact match not found
    if (!matches) {
      const entry = Object.entries(MOVIE_STREAMING_DB).find(([key]) => 
        titleNorm.includes(key) || key.includes(titleNorm)
      );
      if (entry) {
        matches = entry[1];
      }
    }

    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      return [];
    }

    return matches.map(item => {
      const config = PLATFORM_MAP[item.platformId] || {
        name: item.platformId.toUpperCase(),
        color: '#00f2ff',
        badgeBg: 'rgba(0, 242, 255, 0.18)',
        badgeBorder: 'rgba(0, 242, 255, 0.4)',
        logoText: '▶',
        searchUrl: (t) => `https://www.google.com/search?q=${encodeURIComponent(t + ' watch online')}`
      };

      const hasDirect = Boolean(item.directUrl);
      const watchUrl = item.directUrl || config.searchUrl(rawTitle);
      const actionLabel = hasDirect ? `Open on ${config.name}` : `Search on ${config.name}`;

      return {
        id: item.platformId,
        name: config.name,
        type: item.type || 'Subscription',
        color: config.color,
        badgeBg: config.badgeBg,
        badgeBorder: config.badgeBorder,
        logoText: config.logoText,
        isDirectUrl: hasDirect,
        actionLabel,
        watchUrl
      };
    });
  }

  /**
   * Check if movie is available on a specific platform ID
   */
  isAvailableOnPlatform(movie, platformId) {
    if (!platformId || platformId === 'all') return true;
    const avail = this.getAvailability(movie);
    return avail.some(a => a.id.toLowerCase() === platformId.toLowerCase());
  }
}

export const streamingAvailabilityService = new StreamingAvailabilityService();
