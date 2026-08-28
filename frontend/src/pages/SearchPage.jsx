import React, { useEffect, useState, useCallback, useRef } from 'react';
import { STREAMING_PLATFORMS, streamingAvailabilityService } from '../services/streamingAvailabilityService';
import {
  Search, Film, Heart, Zap, Smile, Moon, HeartHandshake, Crown, 
  CloudRain, Flame, Play, Star, Calendar, Globe, Clock, ChevronRight, ChevronLeft, Check, Dices, Ghost, RefreshCw, Home, Sparkles, Tv, SlidersHorizontal, ChevronDown, Compass, CheckCircle2, RotateCcw
} from 'lucide-react';

import { movieSearchService } from '../services/MovieSearchService';
import { movieMindBrain } from '../services/movieMindBrain';
import { movieMindRanker } from '../services/movieMindRanker';
import { movieEnrichmentService } from '../services/movieEnrichmentService';
import { localSimilarityService } from '../services/localSimilarityService';
import { api } from '../services/api';
import SearchResultCard from '../components/SearchResultCard';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import BackButton from '../components/BackButton';
import { safeString, safeGenres } from '../utils/movieUtils';

import './SearchPage.css';

const searchCache = new Map();

// 16 Visually Rich Curated Moods
const DISCOVERY_MOODS = [
  { id: 'adrenaline', emoji: '🔥', icon: Zap, title: 'Adrenaline Rush', subtitle: 'Fast-paced action, high stakes and thrills', query: 'action thriller intense spy', color: '#ff4757', accentBg: 'rgba(255, 71, 87, 0.15)', borderColor: 'rgba(255, 71, 87, 0.4)' },
  { id: 'romance', emoji: '❤️', icon: Heart, title: 'Romantic & Emotional', subtitle: 'Love stories, deep bonds and heartfelt feelings', query: 'romance love emotional relationship', color: '#ff6b81', accentBg: 'rgba(255, 107, 129, 0.15)', borderColor: 'rgba(255, 107, 129, 0.4)' },
  { id: 'feelgood', emoji: '😂', icon: Smile, title: 'Feel Good / Funny', subtitle: 'Lighthearted, fun, laugh-out-loud comedy', query: 'comedy feel good family fun', color: '#ffa502', accentBg: 'rgba(255, 165, 2, 0.15)', borderColor: 'rgba(255, 165, 2, 0.4)' },
  { id: 'thrill', emoji: '😱', icon: Ghost, title: 'Thrilling & Suspenseful', subtitle: 'Edge-of-your-seat twists and tension', query: 'thriller suspense mystery intense', color: '#ff6348', accentBg: 'rgba(255, 99, 72, 0.15)', borderColor: 'rgba(255, 99, 72, 0.4)' },
  { id: 'mystery', emoji: '🕵️', icon: Search, title: 'Mystery & Whodunit', subtitle: 'Puzzles, secrets and detective investigations', query: 'mystery crime investigation puzzle', color: '#a55eea', accentBg: 'rgba(165, 94, 234, 0.15)', borderColor: 'rgba(165, 94, 234, 0.4)' },
  { id: 'deep_emotional', emoji: '😢', icon: HeartHandshake, title: 'Deep Emotional', subtitle: 'Heart-tugging dramas and moving stories', query: 'drama emotional tragic sad touching', color: '#45aaf2', accentBg: 'rgba(69, 170, 242, 0.15)', borderColor: 'rgba(69, 170, 242, 0.4)' },
  { id: 'mindbending', emoji: '🧠', icon: Sparkles, title: 'Mind-Bending', subtitle: 'Complex plots, reality shifts and time warps', query: 'sci-fi psychological mystery time-travel', color: '#00d2d3', accentBg: 'rgba(0, 210, 211, 0.15)', borderColor: 'rgba(0, 210, 211, 0.4)' },
  { id: 'adventure', emoji: '🌍', icon: Flame, title: 'Adventure & Quests', subtitle: 'Exploration, survival and legendary odysseys', query: 'adventure epic exploration journey', color: '#26de81', accentBg: 'rgba(38, 222, 129, 0.15)', borderColor: 'rgba(38, 222, 129, 0.4)' },
  { id: 'epic', emoji: '⚔️', icon: Crown, title: 'Epic Spectacle', subtitle: 'Grand scale blockbusters and heroic sagas', query: 'blockbuster epic fantasy historical action', color: '#fed330', accentBg: 'rgba(254, 211, 48, 0.15)', borderColor: 'rgba(254, 211, 48, 0.4)' },
  { id: 'family', emoji: '👨‍👩‍👧', icon: Home, title: 'Family Together', subtitle: 'Heartwarming, wholesome entertainment', query: 'family animation comedy feel good', color: '#20bf6b', accentBg: 'rgba(32, 191, 107, 0.15)', borderColor: 'rgba(32, 191, 107, 0.4)' },
  { id: 'dark_horror', emoji: '👻', icon: Moon, title: 'Dark / Horror', subtitle: 'Supernatural chills, dark atmospheric tales', query: 'horror dark thriller supernatural', color: '#eb3b5a', accentBg: 'rgba(235, 59, 90, 0.15)', borderColor: 'rgba(235, 59, 90, 0.4)' },
  { id: 'crime', emoji: '🕶️', icon: Film, title: 'Crime & Underworld', subtitle: 'Gangster chronicles, heists and noir', query: 'crime gangster heist police mafia', color: '#4b6584', accentBg: 'rgba(75, 101, 132, 0.15)', borderColor: 'rgba(75, 101, 132, 0.4)' },
  { id: 'scifi', emoji: '🚀', icon: Zap, title: 'Sci-Fi Wonder', subtitle: 'Futuristic technology, space and AI worlds', query: 'sci-fi space futuristic technology alien', color: '#00f2ff', accentBg: 'rgba(0, 242, 255, 0.15)', borderColor: 'rgba(0, 242, 255, 0.4)' },
  { id: 'relaxing', emoji: '🌙', icon: CloudRain, title: 'Relaxing & Comfort', subtitle: 'Calm pacing, slice-of-life and comfort cinema', query: 'drama feel good slice of life cozy', color: '#a5b1c2', accentBg: 'rgba(165, 177, 194, 0.15)', borderColor: 'rgba(165, 177, 194, 0.4)' },
  { id: 'drama', emoji: '🎭', icon: Star, title: 'Dramatic Cinema', subtitle: 'Powerful performances and character studies', query: 'drama performance intensity character', color: '#f7b731', accentBg: 'rgba(247, 183, 49, 0.15)', borderColor: 'rgba(247, 183, 49, 0.4)' },
  { id: 'surpriseme', emoji: '✨', icon: Dices, title: 'Surprise Me', subtitle: 'Let MovieMind AI pick an unexpected masterpiece', query: 'masterpiece top rated classic blockbuster', color: '#8b5cf6', accentBg: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.4)' }
];

const GENRE_OPTIONS = [
  'Action', 'Thriller', 'Romance', 'Comedy', 'Drama', 
  'Crime', 'Mystery', 'Sci-Fi', 'Fantasy', 'Adventure', 
  'Horror', 'Family', 'Animation'
];

const TIME_OPTIONS = [
  { id: 'Quick Watch', title: 'Quick Watch', desc: 'Under 2 hours (Binge friendly)' },
  { id: 'Standard', title: 'Standard Movie', desc: 'Around 2 hours (Classic feature)' },
  { id: 'Long Movie', title: 'Long Epic', desc: '2.5+ hours (Immersive cinematic saga)' }
];

const LANGUAGE_OPTIONS = [
  { id: 'Telugu', label: 'Telugu Cinema' },
  { id: 'Hindi', label: 'Hindi Cinema' },
  { id: 'English', label: 'English / Hollywood' },
  { id: 'Any Language', label: 'Any Language (Global)' }
];

const ERA_OPTIONS = [
  { id: 'Latest Available', title: 'Latest Releases', desc: 'Newest in catalogue', icon: Flame, color: '#ff7f50' },
  { id: 'Modern Favorites', title: 'Modern Blockbusters', desc: 'Popular modern hits', icon: Star, color: '#ffd700' },
  { id: 'Classic Favorites', title: 'Golden Classics', desc: 'Timeless cinematic masterpieces', icon: Crown, color: '#eccc68' },
  { id: 'Hidden Gems', title: 'Hidden Gems', desc: 'Critically acclaimed treasures', icon: Sparkles, color: '#a55eea' },
  { id: 'Surprise Me', title: 'AI Wildcard', desc: 'Diverse algorithmic discovery', icon: Dices, color: '#00d2d3' }
];

const DISCOVERY_STEPS = [
  { step: 1, label: 'Mood', title: 'What are you in the mood for?', subtitle: 'Tell us how you feel right now and we will shape your recommendations around it.' },
  { step: 2, label: 'Experience', title: 'What kind of experience do you want?', subtitle: 'Choose one or more styles & genres you enjoy (Select up to 3).' },
  { step: 3, label: 'Runtime', title: 'How much time do you have?', subtitle: 'Select your preferred movie duration.' },
  { step: 4, label: 'Language', title: 'Which language works best for you?', subtitle: 'Pick your preferred audio/cinema language.' },
  { step: 5, label: 'Discovery Style', title: 'What type of discovery are you looking for?', subtitle: 'Select your era & recommendation style preference.' },
  { step: 6, label: 'Streaming', title: 'Where do you want to watch?', subtitle: 'Select active platforms to prioritize available streaming titles.' }
];

export default function SearchPage({
  initialQuery = '',
  onMovieSelect,
  onBack
}) {
  // 6-Step Journey State
  const [currentStep, setCurrentStep] = useState(1);

  // Global / Direct Search
  const [globalQuery, setGlobalQuery] = useState(initialQuery);
  const [debouncedGlobalQuery, setDebouncedGlobalQuery] = useState(initialQuery);

  // Step 1: Mood State
  const [selectedMood, setSelectedMood] = useState(null);
  
  // Step 2: Genres State
  const [selectedGenres, setSelectedGenres] = useState([]);

  // Step 3..6 Refinements
  const [selectedTime, setSelectedTime] = useState('Standard');
  const [selectedLanguage, setSelectedLanguage] = useState('Any Language');
  const [selectedEra, setSelectedEra] = useState('Latest Available');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['all']);

  // Live Search Dropdown States
  const [showLiveDropdown, setShowLiveDropdown] = useState(false);
  const [liveResults, setLiveResults] = useState([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);

  // Results & UI State
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState(null);

  const resultsRef = useRef(null);
  const dropdownRef = useRef(null);
  const activeSearchId = useRef(0);

  const openTrailer = (url) => { 
    setCurrentTrailerUrl(url); 
    setIsTrailerOpen(true); 
  };
  
  const closeTrailer = () => { 
    setIsTrailerOpen(false); 
    setCurrentTrailerUrl(null); 
  };

  useEffect(() => {
    if (initialQuery !== undefined) {
      setGlobalQuery(initialQuery);
      setDebouncedGlobalQuery(initialQuery);
    }
  }, [initialQuery]);

  // Debounce global search query for autocomplete dropdown
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalQuery(globalQuery);
    }, 280);
    return () => clearTimeout(handler);
  }, [globalQuery]);

  // Handle autocomplete live search
  useEffect(() => {
    if (!debouncedGlobalQuery || debouncedGlobalQuery.trim().length === 0) {
      setLiveResults([]);
      setShowLiveDropdown(false);
      return;
    }

    let isMounted = true;
    setIsLiveLoading(true);
    setShowLiveDropdown(true);

    movieSearchService.searchMovies(debouncedGlobalQuery, 6)
      .then(res => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : (res?.movies || []);
        setLiveResults(list);
        setIsLiveLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn("Live search error:", err);
        setLiveResults([]);
        setIsLiveLoading(false);
      });

    return () => { isMounted = false; };
  }, [debouncedGlobalQuery]);

  // Close live search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowLiveDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Main Discovery Search Execution with Weighted Preference Scoring & Guaranteed Completion
  const executeDiscovery = useCallback(async (overrides = {}) => {
    const searchId = ++activeSearchId.current;
    setLoading(true);
    setSearchError(false);
    setHasSearched(true);

    const moodObj = DISCOVERY_MOODS.find(m => m.id === (overrides.mood || selectedMood)) || DISCOVERY_MOODS[0];
    const genresArr = overrides.genres !== undefined ? overrides.genres : selectedGenres;
    const timeVal = overrides.time || selectedTime;
    const langVal = overrides.language || selectedLanguage;
    const eraVal = overrides.era || selectedEra;
    const platformsArr = overrides.platforms || selectedPlatforms;

    console.log("Explore Preferences:", { mood: moodObj.id, genres: genresArr, time: timeVal, language: langVal, era: eraVal, platforms: platformsArr });

    try {
      // 1. Fetch Candidate Dataset Pool from master datasets synchronously / with fast fallbacks
      let pool = [];

      try {
        const poolPromises = [
          api.getExploreMovies(60).catch(() => []),
          api.getHomeMovies(30).catch(() => ({})),
          api.getPopularMovies(40).catch(() => []),
          localSimilarityService.getLocalDatasetPool().catch(() => [])
        ];

        if (langVal && langVal !== 'Any Language') {
          poolPromises.push(api.searchCatalogueMovies(langVal, 35).catch(() => []));
        }

        const results = await Promise.allSettled(poolPromises);

        results.forEach(res => {
          if (res.status === 'fulfilled' && res.value) {
            const val = res.value;
            if (Array.isArray(val)) {
              pool.push(...val);
            } else if (typeof val === 'object') {
              if (Array.isArray(val.movies)) {
                pool.push(...val.movies);
              } else {
                Object.values(val).forEach(cat => {
                  if (Array.isArray(cat)) pool.push(...cat);
                });
              }
            }
          }
        });
      } catch (poolErr) {
        console.warn("Candidate pool fetch error, using local fallback:", poolErr);
      }

      // Deduplicate pool
      const poolMap = new Map();
      pool.forEach(m => {
        if (m) {
          const norm = normalizeMovie(m);
          if (norm && norm.title) {
            const id = String(norm.movieId || norm.id || norm.title).toLowerCase().trim();
            if (!poolMap.has(id)) {
              poolMap.set(id, norm);
            }
          }
        }
      });

      let candidateList = Array.from(poolMap.values());

      // If pool is empty, fallback to local similarity pool immediately
      if (candidateList.length === 0) {
        candidateList = await localSimilarityService.getLocalDatasetPool();
      }

      console.log("Catalogue Count:", candidateList.length);

      // 2. Score candidate movies based on weighted preferences
      const scoredCandidates = (candidateList || []).map(movie => {
        let score = (parseFloat(movie.rating || movie.vote_average || movie.avg_rating) || 7.5) * 2;
        const movieGenres = (movie.genres || movie.genre || '').toLowerCase();
        const movieLang = (movie.language || movie.original_language || '').toLowerCase();
        const movieTitle = (movie.title || movie.original_title || '').toLowerCase();
        const movieOverview = (movie.overview || movie.description || '').toLowerCase();
        const movieYear = parseInt(movie.year || movie.release_year || '2020', 10);
        const movieRuntime = parseInt(movie.runtime || '120', 10);

        // A. Mood Match (+35 pts)
        if (moodObj && moodObj.query) {
          const moodKeywords = moodObj.query.toLowerCase().split(' ');
          const hasMoodMatch = moodKeywords.some(kw => 
            movieGenres.includes(kw) || movieOverview.includes(kw) || movieTitle.includes(kw)
          );
          if (hasMoodMatch) score += 35;
        }

        // B. Genre Match (+25 per matching genre)
        if (genresArr.length > 0) {
          genresArr.forEach(g => {
            if (movieGenres.includes(g.toLowerCase())) {
              score += 25;
            }
          });
        }

        // C. Language Match (+35 pts for exact language)
        if (langVal && langVal !== 'Any Language') {
          const cleanLang = langVal.toLowerCase();
          if (movieLang.includes(cleanLang) || movieTitle.includes(cleanLang)) {
            score += 35;
          }
        }

        // D. OTT / Platform Preference Bonus (+25 pts - NEVER eliminates)
        if (platformsArr && !platformsArr.includes('all') && platformsArr.length > 0) {
          const isAvail = platformsArr.some(pId => streamingAvailabilityService.isAvailableOnPlatform(movie, pId));
          if (isAvail) score += 25;
        }

        // E. Runtime Match (+15 pts)
        if (timeVal === 'Quick Watch' && movieRuntime < 115) score += 15;
        else if (timeVal === 'Standard' && movieRuntime >= 105 && movieRuntime <= 145) score += 15;
        else if (timeVal === 'Long Movie' && movieRuntime >= 140) score += 15;

        // F. Era Match (+15 pts)
        if (eraVal === 'Latest Available' && movieYear >= 2020) score += 15;
        else if (eraVal === 'Modern Favorites' && movieYear >= 2005 && movieYear <= 2021) score += 15;
        else if (eraVal === 'Classic Favorites' && movieYear < 2005) score += 15;
        else if (eraVal === 'Hidden Gems' && (parseFloat(movie.rating) || 0) >= 7.8) score += 15;
        else if (eraVal === 'Surprise Me') score += Math.random() * 12;

        return {
          ...movie,
          discoveryScore: Math.round(score),
          movieMindScore: Math.min(99, Math.round(score))
        };
      });

      // 3. Sort descending by score
      scoredCandidates.sort((a, b) => b.discoveryScore - a.discoveryScore);

      // 4. Take top unique movies
      const seenIds = new Set();
      const finalMovies = [];
      for (const item of scoredCandidates) {
        const id = String(item.movieId || item.id || item.title).toLowerCase().trim();
        if (!seenIds.has(id)) {
          seenIds.add(id);
          finalMovies.push(item);
        }
        if (finalMovies.length >= 18) break;
      }

      console.log("Final Recommendations Count:", finalMovies.length);

      if (searchId === activeSearchId.current && finalMovies.length > 0) {
        setMovies(finalMovies);
      }

    } catch (err) {
      console.error("Discovery error:", err);
      if (searchId === activeSearchId.current) {
        try {
          const fallbackPool = await localSimilarityService.getLocalDatasetPool();
          if (fallbackPool.length > 0) {
            setMovies(fallbackPool.slice(0, 18));
          } else {
            setSearchError(true);
          }
        } catch {
          setSearchError(true);
        }
      }
    } finally {
      if (searchId === activeSearchId.current) {
        setLoading(false);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [selectedMood, selectedGenres, selectedTime, selectedLanguage, selectedEra, selectedPlatforms]);

  // Initial load
  useEffect(() => {
    if (!hasSearched && movies.length === 0) {
      setSelectedMood('adrenaline');
      executeDiscovery({ mood: 'adrenaline' });
    }
  }, [hasSearched, movies.length, executeDiscovery]);

  const handleGlobalSubmit = (e) => {
    e.preventDefault();
    if (!globalQuery.trim()) return;
    setShowLiveDropdown(false);
    
    setLoading(true);
    setHasSearched(true);
    movieSearchService.searchMovies(globalQuery, 18)
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.movies || []);
        return Promise.all(list.map(m => movieEnrichmentService.enrichMovie(m).catch(() => m)));
      })
      .then(enriched => {
        setMovies(enriched);
        setLoading(false);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      })
      .catch(() => {
        setSearchError(true);
        setLoading(false);
      });
  };

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
  };

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      }
      if (prev.length >= 3) return prev;
      return [...prev, genre];
    });
  };

  const togglePlatform = (platId) => {
    if (platId === 'all') {
      setSelectedPlatforms(['all']);
      return;
    }
    setSelectedPlatforms(prev => {
      const filtered = prev.filter(p => p !== 'all');
      if (filtered.includes(platId)) {
        const next = filtered.filter(p => p !== platId);
        return next.length === 0 ? ['all'] : next;
      }
      return [...filtered, platId];
    });
  };

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      executeDiscovery();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleResetJourney = () => {
    setCurrentStep(1);
    setSelectedMood('adrenaline');
    setSelectedGenres([]);
    setSelectedTime('Standard');
    setSelectedLanguage('Any Language');
    setSelectedEra('Latest Available');
    setSelectedPlatforms(['all']);
    executeDiscovery({ mood: 'adrenaline', genres: [], time: 'Standard', language: 'Any Language', era: 'Latest Available' });
  };

  const displayMovies = movies;
  const bestMatch = displayMovies[0];
  const moreMatches = displayMovies.slice(1, 7);
  const differentStyle = displayMovies.slice(7, 13);

  const activeStepObj = DISCOVERY_STEPS.find(s => s.step === currentStep) || DISCOVERY_STEPS[0];

  return (
    <div className="dataset-search-page discovery-engine-page">
      
      {onBack && <BackButton onBack={onBack} />}

      {/* HEADER SECTION WITH GLOBAL SEARCH */}
      <div className="discovery-header-area">
        <div className="discovery-title-area">
          <span className="dataset-search-label">MOVIEMIND CINEMATIC DISCOVERY ENGINE</span>
          <h1>Let's find your perfect movie <span className="text-cyan">tonight✨</span></h1>
          <p>Complete your personalized step-by-step discovery journey or search any title directly.</p>
        </div>
        
        <div className="global-search-wrapper" ref={dropdownRef}>
          <form className="global-search-bar" onSubmit={handleGlobalSubmit}>
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search titles, actors, directors, genres (e.g. RRR, Baahubali, Inception)..." 
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              onFocus={() => { if (globalQuery.trim()) setShowLiveDropdown(true); }}
            />
          </form>

          {showLiveDropdown && (
            <div className="live-search-dropdown fade-in">
              {isLiveLoading ? (
                <div className="live-search-empty">Searching cinema archive...</div>
              ) : liveResults.length > 0 ? (
                liveResults.map(m => (
                  <div 
                    key={m.movieId || m.id || m.title} 
                    className="live-search-item"
                    onClick={() => {
                      setShowLiveDropdown(false);
                      onMovieSelect?.(m);
                    }}
                  >
                    {m.poster ? (
                      <img src={m.poster} alt={m.title} className="live-search-poster" />
                    ) : (
                      <div className="live-search-poster-fallback"><Film size={18} /></div>
                    )}
                    <div className="live-search-info">
                      <h4>{safeString(m.title)}</h4>
                      <p>{safeString(m.year)} • {safeString(m.language)} • {safeGenres(m.genres)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="live-search-empty">No direct matches found in archive.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6-STEP INTERACTIVE PROGRESS STEPPER BAR */}
      <div className="discovery-progress-stepper">
        <div className="stepper-header-row">
          <div className="stepper-title">
            <Compass size={18} className="text-cyan" />
            <span>DISCOVERY JOURNEY</span>
          </div>
          <button className="reset-journey-btn" onClick={handleResetJourney}>
            <RotateCcw size={14} /> Reset Exploration
          </button>
        </div>

        <div className="stepper-pills-row">
          {DISCOVERY_STEPS.map(s => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                className={`stepper-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setCurrentStep(s.step)}
              >
                <div className="step-num">
                  {isCompleted ? <CheckCircle2 size={13} /> : `0${s.step}`}
                </div>
                <span className="step-name">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTAINER */}
      <section className="discovery-step-card fade-in">
        <div className="step-card-header">
          <div className="step-badge">STEP {activeStepObj.step} OF 6</div>
          <h2>{activeStepObj.title}</h2>
          <p>{activeStepObj.subtitle}</p>
        </div>

        {/* STEP 1: 16 MOODS GRID */}
        {currentStep === 1 && (
          <div className="step-content-body">
            <div className="rich-mood-grid">
              {DISCOVERY_MOODS.map(m => {
                const Icon = m.icon;
                const isActive = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    className={`rich-mood-card ${isActive ? 'active' : ''}`}
                    onClick={() => handleMoodSelect(m.id)}
                    style={{
                      borderColor: isActive ? m.color : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: isActive ? `0 8px 25px ${m.accentBg}` : 'none',
                      background: isActive ? m.accentBg : 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <div className="mood-card-top">
                      <span className="mood-emoji">{m.emoji}</span>
                      <div className="mood-icon-wrap" style={{ color: m.color, backgroundColor: m.accentBg }}>
                        <Icon size={20} />
                      </div>
                      {isActive && <div className="mood-check-badge" style={{ backgroundColor: m.color }}><Check size={12} /></div>}
                    </div>

                    <h3 style={{ color: isActive ? m.color : '#ffffff' }}>{m.title}</h3>
                    <p>{m.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE / GENRES */}
        {currentStep === 2 && (
          <div className="step-content-body">
            <div className="step-options-chips-grid">
              {GENRE_OPTIONS.map(genre => {
                const isActive = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    className={`experience-chip-btn ${isActive ? 'active' : ''}`}
                    onClick={() => toggleGenre(genre)}
                  >
                    <span>{genre}</span>
                    {isActive && <Check size={14} className="text-cyan" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: RUNTIME */}
        {currentStep === 3 && (
          <div className="step-content-body">
            <div className="step-options-cards-grid">
              {TIME_OPTIONS.map(t => {
                const isActive = selectedTime === t.id;
                return (
                  <button
                    key={t.id}
                    className={`time-card-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedTime(t.id)}
                  >
                    <div className="time-card-icon">
                      <Clock size={24} className={isActive ? 'text-cyan' : ''} />
                    </div>
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                    {isActive && <div className="card-check-circle"><Check size={14} /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: LANGUAGE */}
        {currentStep === 4 && (
          <div className="step-content-body">
            <div className="step-options-cards-grid">
              {LANGUAGE_OPTIONS.map(lang => {
                const isActive = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    className={`lang-card-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedLanguage(lang.id)}
                  >
                    <div className="lang-code-badge">
                      {lang.id.substring(0, 2).toUpperCase()}
                    </div>
                    <h3>{lang.label}</h3>
                    {isActive && <div className="card-check-circle"><Check size={14} /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: DISCOVERY STYLE / ERA */}
        {currentStep === 5 && (
          <div className="step-content-body">
            <div className="step-options-cards-grid">
              {ERA_OPTIONS.map(era => {
                const Icon = era.icon;
                const isActive = selectedEra === era.id;
                return (
                  <button
                    key={era.id}
                    className={`era-card-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedEra(era.id)}
                  >
                    <div className="era-icon-badge" style={{ color: era.color, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                      <Icon size={24} />
                    </div>
                    <h3>{era.title}</h3>
                    <p>{era.desc}</p>
                    {isActive && <div className="card-check-circle"><Check size={14} /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: STREAMING PLATFORMS MULTI-SELECT */}
        {currentStep === 6 && (
          <div className="step-content-body">
            <div className="ott-platform-multi-grid">
              {STREAMING_PLATFORMS.map(plat => {
                const isSelected = selectedPlatforms.includes(plat.id);
                return (
                  <button
                    key={plat.id}
                    className={`ott-platform-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => togglePlatform(plat.id)}
                    style={{
                      borderColor: isSelected ? plat.color : 'rgba(255, 255, 255, 0.12)',
                      backgroundColor: isSelected ? plat.badgeBg || 'rgba(0, 242, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <div className="ott-emblem-badge" style={{ color: plat.color }}>
                      {plat.logoText || '▶'}
                    </div>
                    <span className="ott-name" style={{ color: isSelected ? plat.color : '#cbd5e1' }}>{plat.name}</span>
                    {isSelected && <div className="ott-check"><Check size={12} /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP CONTROLS FOOTER TOOLBAR */}
        <div className="step-card-footer">
          <button 
            className="step-nav-btn prev-btn" 
            onClick={handlePrevStep} 
            disabled={currentStep === 1}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="footer-right-actions">
            {currentStep < 6 && (
              <button className="step-nav-btn skip-btn" onClick={() => setCurrentStep(prev => prev + 1)}>
                Skip Step
              </button>
            )}

            {currentStep < 6 && (
              <button className="step-nav-btn next-btn" onClick={handleNextStep}>
                Next Step <ChevronRight size={16} />
              </button>
            )}

            <button 
              className={`find-perfect-btn journey-generate-btn ${currentStep === 6 ? 'highlighted-active' : ''}`} 
              onClick={() => executeDiscovery()}
            >
              <span>Find My Movie</span> <Sparkles size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* RESULTS SECTION */}
      <div ref={resultsRef} className="scroll-anchor"></div>
      
      {loading && hasSearched && (
        <section className="discovery-step-section results-section">
          <div className="step-header">
            <div className="step-number pulse">AI</div>
            <div className="step-text">
              <h2>ANALYZING MOVIEMIND ARCHIVE...</h2>
              <p>Curating personalized recommendations for your journey.</p>
            </div>
          </div>
          <div className="discovery-skeleton">
            <div className="skeleton-best-match"></div>
            <div className="skeleton-row">
              {[1,2,3,4,5].map(n => <div key={n} className="skeleton-card"></div>)}
            </div>
          </div>
        </section>
      )}

      {!loading && hasSearched && !searchError && movies.length > 0 && (
        <section className="results-section fade-in" ref={resultsRef}>
          <div className="scroll-anchor"></div>
          
          <div className="results-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#cbd5e1', letterSpacing: '1px' }}>
              {!selectedPlatforms.includes('all') && selectedPlatforms.length > 0
                ? `RECOMMENDED FOR YOUR MOOD & PLATFORM PREFERENCES`
                : `RECOMMENDED FOR YOUR MOOD & PREFERENCES`}
            </h3>
            <span className="src-ai-badge" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} /> Smart Match Engine
            </span>
          </div>

          {bestMatch && (
            <div className="best-match-card" onClick={() => onMovieSelect(bestMatch)}>
              <div className="best-match-badge"><Star size={14} fill="currentColor" /> BEST MATCH</div>
              
              <div className="bm-content">
                <div className="bm-poster-area">
                  {bestMatch.poster ? (
                    <img src={bestMatch.poster} alt={bestMatch.title} className="bm-poster" />
                  ) : (
                    <div className="bm-poster" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', color: '#64748b' }}>
                      <Film size={48} />
                    </div>
                  )}
                  <div className="match-circle">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" strokeDasharray={`${bestMatch.movieMindScore || Math.round((parseFloat(bestMatch.rating) || 8.5) * 10)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="percentage">{bestMatch.movieMindScore || Math.round((parseFloat(bestMatch.rating) || 8.5) * 10)}%<span>MATCH</span></div>
                  </div>
                </div>

                <div className="bm-info">
                  <h2>{safeString(bestMatch.title, 'Unknown Movie')}</h2>
                  <div className="bm-meta">
                    <span>{safeGenres(bestMatch.genres)}</span>
                    <span className="dot">•</span>
                    <span>{safeString(bestMatch.year)}</span>
                    <span className="dot">•</span>
                    <span>{safeString(bestMatch.runtime)}</span>
                    <span className="dot">•</span>
                    <span>{safeString(bestMatch.language)}</span>
                  </div>

                  <div className="bm-rating">
                    <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                    <span className="rating-val">{safeString(bestMatch.rating, 'N/A')}/10</span>
                  </div>

                  <p className="bm-overview">{safeString(bestMatch.overview, 'No overview available for this movie. Explore details to learn more.')}</p>
                  
                  <div className="bm-tags">
                    <span className="tag"><Check size={14} className="text-cyan" /> High intensity</span>
                    <span className="tag"><Check size={14} className="text-cyan" /> Thrilling narrative</span>
                    <span className="tag"><Check size={14} className="text-violet" /> Matches your taste</span>
                    {bestMatch.language && <span className="tag"><Check size={14} className="text-cyan" /> {bestMatch.language} cinema</span>}
                  </div>

                  <div className="bm-actions">
                    <button className="btn-primary" onClick={(e) => {
                      e.stopPropagation();
                      const trailerUrl = bestMatch.trailer?.url;
                      if (trailerUrl) {
                        bestMatch.trailer.embedUrl ? openTrailer(trailerUrl) : window.open(trailerUrl, '_blank');
                      }
                    }}>
                      <Play size={18} fill="currentColor" /> Watch Trailer
                    </button>
                    <button className="btn-secondary" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (bestMatch) {
                        onMovieSelect?.(bestMatch);
                      }
                    }}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {moreMatches.length > 0 && (
            <div className="more-matches-area">
              <h3>MORE PERFECT MATCHES</h3>
              <div className="matches-grid">
                {moreMatches.map(movie => (
                  <SearchResultCard key={movie.movieId || movie.id} movie={movie} onMovieSelect={onMovieSelect} onWatchTrailer={openTrailer} />
                ))}
              </div>
            </div>
          )}

          {differentStyle.length > 0 && (
            <div className="more-matches-area mt-8">
              <h3>SAME MOOD, DIFFERENT STYLE</h3>
              <div className="matches-grid">
                {differentStyle.map(movie => (
                  <SearchResultCard key={movie.movieId || movie.id} movie={movie} onMovieSelect={onMovieSelect} onWatchTrailer={openTrailer} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {!loading && hasSearched && !searchError && displayMovies.length === 0 && (
        <div className="dataset-empty fade-in" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <Film size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h2 style={{ color: '#ffffff', margin: '0 0 10px', fontSize: '1.4rem' }}>
            {globalQuery ? `No movies found for '${globalQuery}'` : `No matching movies found`}
          </h2>
          <p style={{ margin: 0, fontSize: '0.92rem' }}>
            Try another title, actor, genre, or language to discover cinema options.
          </p>
        </div>
      )}

      {/* TRAILER MODAL */}
      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={closeTrailer} 
        videoUrl={currentTrailerUrl} 
      />
    </div>
  );
}
