const FAVOURITES_KEY = 'moviemind_favourites';
const WATCHLIST_KEY = 'moviemind_watchlist';
const HISTORY_KEY = 'moviemind_history';
const MAX_HISTORY = 50;

function getStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return [];
  }
}

function setStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
}

export const userStorage = {
  // Favourites
  getFavourites: () => getStorage(FAVOURITES_KEY),
  
  isFavourite: (movieId) => {
    if (!movieId) return false;
    const favs = getStorage(FAVOURITES_KEY);
    return Array.isArray(favs) && favs.some(m => m && m.movieId === movieId);
  },
  
  toggleFavourite: (movie) => {
    if (!movie || !movie.movieId) return false;
    const favs = getStorage(FAVOURITES_KEY);
    if (!Array.isArray(favs)) return false;
    const existingIndex = favs.findIndex(m => m && m.movieId === movie.movieId);
    
    if (existingIndex >= 0) {
      favs.splice(existingIndex, 1);
      setStorage(FAVOURITES_KEY, favs);
      return false; // Removed
    } else {
      favs.unshift({ ...movie, addedAt: Date.now() });
      setStorage(FAVOURITES_KEY, favs);
      return true; // Added
    }
  },

  // Watchlist
  getWatchlist: () => getStorage(WATCHLIST_KEY),
  
  isInWatchlist: (movieId) => {
    if (!movieId) return false;
    const list = getStorage(WATCHLIST_KEY);
    return Array.isArray(list) && list.some(m => m && m.movieId === movieId);
  },
  
  toggleWatchlist: (movie) => {
    if (!movie || !movie.movieId) return false;
    const list = getStorage(WATCHLIST_KEY);
    if (!Array.isArray(list)) return false;
    const existingIndex = list.findIndex(m => m && m.movieId === movie.movieId);
    
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      setStorage(WATCHLIST_KEY, list);
      return false; // Removed
    } else {
      list.unshift({ ...movie, addedAt: Date.now() });
      setStorage(WATCHLIST_KEY, list);
      return true; // Added
    }
  },

  // History
  getHistory: () => getStorage(HISTORY_KEY),
  
  addToHistory: (movie) => {
    if (!movie || !movie.movieId) return;
    const history = getStorage(HISTORY_KEY);
    if (!Array.isArray(history)) return;
    
    // Remove if exists to move to top (LRU)
    const existingIndex = history.findIndex(m => m && m.movieId === movie.movieId);
    if (existingIndex >= 0) {
      history.splice(existingIndex, 1);
    }
    
    history.unshift({ ...movie, viewedAt: Date.now() });
    
    // Cap at MAX_HISTORY
    if (history.length > MAX_HISTORY) {
      history.pop();
    }
    
    setStorage(HISTORY_KEY, history);
  },
  
  clearHistory: () => {
    setStorage(HISTORY_KEY, []);
  }
};
