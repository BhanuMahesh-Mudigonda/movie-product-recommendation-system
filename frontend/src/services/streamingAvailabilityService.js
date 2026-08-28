/**
 * MovieMind Non-Destructive Streaming Availability Service
 * Maps movies to verified streaming, rental, and buy platforms (India focus).
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
  netflix: { name: 'Netflix', color: '#E50914', badgeBg: 'rgba(229, 9, 20, 0.18)', badgeBorder: 'rgba(229, 9, 20, 0.4)', searchUrl: (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}` },
  prime: { name: 'Prime Video', color: '#00A8E1', badgeBg: 'rgba(0, 168, 225, 0.18)', badgeBorder: 'rgba(0, 168, 225, 0.4)', searchUrl: (t) => `https://www.primevideo.com/search?phrase=${encodeURIComponent(t)}` },
  hotstar: { name: 'JioHotstar', color: '#3182CE', badgeBg: 'rgba(49, 130, 206, 0.18)', badgeBorder: 'rgba(49, 130, 206, 0.4)', searchUrl: (t) => `https://www.hotstar.com/in/search?q=${encodeURIComponent(t)}` },
  aha: { name: 'Aha', color: '#FF6600', badgeBg: 'rgba(255, 102, 0, 0.18)', badgeBorder: 'rgba(255, 102, 0, 0.4)', searchUrl: (t) => `https://www.aha.video/search?q=${encodeURIComponent(t)}` },
  zee5: { name: 'Zee5', color: '#A822D6', badgeBg: 'rgba(168, 34, 214, 0.18)', badgeBorder: 'rgba(168, 34, 214, 0.4)', searchUrl: (t) => `https://www.zee5.com/search?q=${encodeURIComponent(t)}` },
  sonyliv: { name: 'SonyLIV', color: '#0099FF', badgeBg: 'rgba(0, 153, 255, 0.18)', badgeBorder: 'rgba(0, 153, 255, 0.4)', searchUrl: (t) => `https://www.sonyliv.com/search?q=${encodeURIComponent(t)}` },
  sunnxt: { name: 'Sun NXT', color: '#FFCC00', badgeBg: 'rgba(255, 204, 0, 0.18)', badgeBorder: 'rgba(255, 204, 0, 0.4)', searchUrl: (t) => `https://www.sunnxt.com/search?q=${encodeURIComponent(t)}` },
  youtube: { name: 'YouTube', color: '#FF0000', badgeBg: 'rgba(255, 0, 0, 0.18)', badgeBorder: 'rgba(255, 0, 0, 0.4)', searchUrl: (t) => `https://www.youtube.com/results?search_query=${encodeURIComponent(t + ' full movie')}` },
  appletv: { name: 'Apple TV', color: '#E2E8F0', badgeBg: 'rgba(226, 232, 240, 0.18)', badgeBorder: 'rgba(226, 232, 240, 0.4)', searchUrl: (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}` }
};

// Curated verified platform availability database for MovieMind catalogue
const MOVIE_STREAMING_DB = {
  "baahubali 2: the conclusion": [
    { platformId: 'hotstar', type: 'Streaming' },
    { platformId: 'netflix', type: 'Streaming' },
    { platformId: 'youtube', type: 'Rent / Buy' }
  ],
  "baahubali 2": [
    { platformId: 'hotstar', type: 'Streaming' },
    { platformId: 'netflix', type: 'Streaming' },
    { platformId: 'youtube', type: 'Rent / Buy' }
  ],
  "rrr": [
    { platformId: 'netflix', type: 'Streaming' },
    { platformId: 'hotstar', type: 'Streaming' },
    { platformId: 'zee5', type: 'Streaming' }
  ],
  "kalki 2898 ad": [
    { platformId: 'prime', type: 'Streaming' },
    { platformId: 'netflix', type: 'Streaming' }
  ],
  "pushpa: the rise": [
    { platformId: 'prime', type: 'Streaming' },
    { platformId: 'youtube', type: 'Rent / Buy' }
  ],
  "pushpa 2: the rule": [
    { platformId: 'netflix', type: 'Streaming' }
  ],
  "salaar: part 1 – ceasefire": [
    { platformId: 'hotstar', type: 'Streaming' },
    { platformId: 'netflix', type: 'Streaming' }
  ],
  "arjun reddy": [
    { platformId: 'hotstar', type: 'Streaming' },
    { platformId: 'prime', type: 'Streaming' }
  ],
  "jersey": [
    { platformId: 'zee5', type: 'Streaming' },
    { platformId: 'hotstar', type: 'Streaming' }
  ],
  "ala vaikunthapurramuloo": [
    { platformId: 'netflix', type: 'Streaming' },
    { platformId: 'sunnxt', type: 'Streaming' }
  ],
  "rangasthalam": [
    { platformId: 'hotstar', type: 'Streaming' }
  ],
  "eega": [
    { platformId: 'hotstar', type: 'Streaming' },
    { platformId: 'sunnxt', type: 'Streaming' }
  ],
  "sita ramam": [
    { platformId: 'prime', type: 'Streaming' }
  ],
  "hi nanna": [
    { platformId: 'netflix', type: 'Streaming' }
  ],
  "shyam singha roy": [
    { platformId: 'netflix', type: 'Streaming' }
  ],
  "mahanati": [
    { platformId: 'prime', type: 'Streaming' }
  ],
  "c/o kancharapalem": [
    { platformId: 'netflix', type: 'Streaming' }
  ],
  "inception": [
    { platformId: 'netflix', type: 'Streaming' },
    { platformId: 'prime', type: 'Rent / Buy' },
    { platformId: 'youtube', type: 'Rent / Buy' }
  ],
  "interstellar": [
    { platformId: 'prime', type: 'Streaming' },
    { platformId: 'youtube', type: 'Rent / Buy' }
  ],
  "star wars: episode v - the empire strikes back": [
    { platformId: 'hotstar', type: 'Streaming' }
  ],
  "star wars: episode iv - a new hope": [
    { platformId: 'hotstar', type: 'Streaming' }
  ],
  "star wars: episode vi - return of the jedi": [
    { platformId: 'hotstar', type: 'Streaming' }
  ],
  "gladiator": [
    { platformId: 'prime', type: 'Streaming' },
    { platformId: 'netflix', type: 'Streaming' }
  ],
  "avatar": [
    { platformId: 'hotstar', type: 'Streaming' }
  ],
  "titanic": [
    { platformId: 'hotstar', type: 'Streaming' }
  ],
  "good will hunting": [
    { platformId: 'prime', type: 'Streaming' }
  ],
  "mad max: fury road": [
    { platformId: 'prime', type: 'Streaming' },
    { platformId: 'youtube', type: 'Rent / Buy' }
  ],
  "finding nemo": [
    { platformId: 'hotstar', type: 'Streaming' }
  ],
  "schindler's list": [
    { platformId: 'prime', type: 'Rent / Buy' },
    { platformId: 'youtube', type: 'Rent / Buy' }
  ],
  "saving private ryan": [
    { platformId: 'prime', type: 'Streaming' },
    { platformId: 'netflix', type: 'Streaming' }
  ],
  "braveheart": [
    { platformId: 'hotstar', type: 'Streaming' },
    { platformId: 'prime', type: 'Rent / Buy' }
  ],
  "forrest gump": [
    { platformId: 'prime', type: 'Streaming' }
  ],
  "fight club": [
    { platformId: 'prime', type: 'Streaming' }
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
        searchUrl: (t) => `https://www.google.com/search?q=${encodeURIComponent(t + ' watch online')}`
      };

      return {
        id: item.platformId,
        name: config.name,
        type: item.type || 'Streaming',
        color: config.color,
        badgeBg: config.badgeBg,
        badgeBorder: config.badgeBorder,
        watchUrl: config.searchUrl(rawTitle)
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
