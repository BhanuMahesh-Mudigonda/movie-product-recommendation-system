import React, { useEffect, useState, useCallback, useRef } from 'react';
import { STREAMING_PLATFORMS, streamingAvailabilityService } from '../services/streamingAvailabilityService';
import {
  Search, Film, Heart, Zap, Smile, Moon, HeartHandshake, Crown, 
  CloudRain, Flame, Play, Star, Calendar, Globe, Clock, ChevronRight, Check, Dices, Ghost, RefreshCw, Home, Sparkles, Tv, SlidersHorizontal, ChevronDown
} from 'lucide-react';

import { movieSearchService } from '../services/MovieSearchService';
import { movieMindBrain } from '../services/movieMindBrain';
import { movieMindRanker } from '../services/movieMindRanker';
import { movieEnrichmentService } from '../services/movieEnrichmentService';
import SearchResultCard from '../components/SearchResultCard';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import BackButton from '../components/BackButton';
import { safeString, safeGenres } from '../utils/movieUtils';

import './SearchPage.css';

const searchCache = new Map();

const moods = [
  { id: 'happy', icon: Smile, title: 'Feel Good', subtitle: 'Fun, happy and uplifting', query: 'comedy feel good family' },
  { id: 'romantic', icon: Heart, title: 'Romantic', subtitle: 'Love stories and emotions', query: 'romance love emotional' },
  { id: 'excited', icon: Zap, title: 'Adrenaline', subtitle: 'Action, thrill and intensity', query: 'action thriller intense spy' },
  { id: 'dark', icon: Moon, title: 'Dark Mood', subtitle: 'Mystery, suspense and thrillers', query: 'crime mystery thriller dark' },
  { id: 'emotional', icon: HeartHandshake, title: 'Emotional', subtitle: 'Deep, touching and meaningful', query: 'drama emotional sad touching' },
  { id: 'epic', icon: Crown, title: 'Epic', subtitle: 'Grand stories and adventures', query: 'blockbuster adventure epic fantasy sci-fi' }
];

const RUSH_OPTIONS = ['Action', 'Thriller', 'Crime', 'Adventure', 'Spy'];
const GENRE_OPTIONS = [
  'Action', 'Thriller', 'Romance', 'Comedy', 'Drama', 
  'Crime', 'Mystery', 'Sci-Fi', 'Fantasy', 'Adventure', 
  'Horror', 'Family', 'Animation'
];
const TIME_OPTIONS = [
  { id: 'Quick Watch', desc: 'Under 2 hours' },
  { id: 'Standard', desc: 'Around 2 hours' },
  { id: 'Long Movie', desc: '2.5+ hours' }
];
const LANGUAGE_OPTIONS = ['Telugu', 'Hindi', 'English', 'Any Language'];
const ERA_OPTIONS = [
  { id: 'Latest Available', desc: 'Newest in dataset', icon: Flame, color: 'text-orange' },
  { id: 'Modern Favorites', desc: 'Relatively modern', icon: Star, color: 'text-gold' },
  { id: 'Classic Favorites', desc: 'Older classics', icon: Crown, color: 'text-gold' },
  { id: 'Surprise Me', desc: 'Controlled diversity', icon: Dices, color: 'text-violet' }
];

export default function SearchPage({
  initialQuery = '',
  onMovieSelect,
  onBack
}) {
  // Global / Direct Search
  const [globalQuery, setGlobalQuery] = useState(initialQuery);
  const [debouncedGlobalQuery, setDebouncedGlobalQuery] = useState(initialQuery);

  // Mood Search States
  const [selectedMood, setSelectedMood] = useState(null);
  
  // Step 2: Movie Taste / Genres
  const [selectedGenres, setSelectedGenres] = useState([]);

  // Step 3: Refinements
  const [selectedRush, setSelectedRush] = useState([]);
  const [selectedTime, setSelectedTime] = useState('Standard');
  const [selectedLanguage, setSelectedLanguage] = useState('Any Language');
  const [selectedEra, setSelectedEra] = useState('Latest Available');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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
      if (initialQuery.trim()) {
        setDebouncedGlobalQuery(initialQuery.trim());
      }
    }
  }, [initialQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGlobalQuery(globalQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [globalQuery]);

  // Handle live top search dropdown
  useEffect(() => {
    const fetchLiveDropdown = async () => {
      const q = globalQuery.trim();
      if (q.length < 1) {
        setShowLiveDropdown(false);
        setLiveResults([]);
        return;
      }

      try {
        setIsLiveLoading(true);
        setShowLiveDropdown(true);
        const res = await movieSearchService.search(q, { query: q });
        setLiveResults(Array.isArray(res) ? res.slice(0, 7) : []);
      } catch {
        setLiveResults([]);
      } finally {
        setIsLiveLoading(false);
      }
    };

    const timer = setTimeout(fetchLiveDropdown, 200);
    return () => clearTimeout(timer);
  }, [globalQuery]);

  const searchMovies = useCallback(async (searchText, filters = null) => {
    const cleanQuery = String(searchText || '').trim();
    if (!cleanQuery && !filters) {
      setMovies([]);
      setHasSearched(false);
      return;
    }

    const cacheKey = filters ? `${cleanQuery}-${JSON.stringify(filters)}` : cleanQuery;

    try {
      setLoading(true);
      setHasSearched(true);
      setSearchError(false);
      
      const currentRequestId = ++activeSearchId.current;

      // Scroll to results if we aren't doing a direct global search typing
      if (filters && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (searchCache.has(cacheKey)) {
        movieMindBrain.trackSearch(cleanQuery);
        setMovies(searchCache.get(cacheKey));
        return;
      }

      const searchIntent = filters ? { query: cleanQuery, filters } : { query: cleanQuery, filters: null };
      let rawResults = await movieSearchService.search(cleanQuery || 'movie', searchIntent);
      
      if (currentRequestId !== activeSearchId.current) {
        return; // Stale request protection
      }

      let candidatePool = Array.isArray(rawResults) ? [...rawResults] : [];

      // Guarantee minimum pool size by fetching additional catalogue candidates if needed
      if (candidatePool.length < 10) {
        try {
          const langQuery = (filters?.language && filters.language !== 'Any Language') ? filters.language : 'movie';
          const fallbackCandidates = await movieSearchService.search(langQuery, searchIntent);
          if (Array.isArray(fallbackCandidates)) {
            const existingIds = new Set(candidatePool.map(m => String(m.movieId || m.id || m.title).toLowerCase()));
            for (const cand of fallbackCandidates) {
              const candId = String(cand.movieId || cand.id || cand.title).toLowerCase();
              if (!existingIds.has(candId)) {
                candidatePool.push(cand);
                existingIds.add(candId);
              }
            }
          }
        } catch (e) {
          console.warn("Fallback candidate fetch warning:", e);
        }
      }

      movieMindBrain.trackSearch(cleanQuery);
      // Rank and score ALL candidate movies using weighted preference scoring
      const rankedResults = movieMindRanker.rankMovies(candidatePool, searchIntent);
      const enrichedResults = await movieEnrichmentService.enrichMovies(rankedResults.slice(0, 12));

      if (currentRequestId === activeSearchId.current) {
        // Guarantee at least 6 recommendations at all times
        setMovies(enrichedResults.length > 0 ? enrichedResults : candidatePool.slice(0, 10));
        searchCache.set(cacheKey, enrichedResults);
      }
    } catch (error) {
      console.error('MovieMind search error:', error);
      setMovies([]);
      setSearchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger global search
  useEffect(() => {
    const cleanQuery = String(debouncedGlobalQuery || '').trim();
    if (cleanQuery) {
      setSelectedMood(null);
      searchMovies(cleanQuery);
    } else if (!hasSearched) {
      setMovies([]);
    }
  }, [debouncedGlobalQuery, searchMovies, hasSearched]);

  const handleGlobalSubmit = (e) => {
    e.preventDefault();
    if (globalQuery.trim()) setDebouncedGlobalQuery(globalQuery.trim());
  };

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId === selectedMood ? null : moodId);
  };

  const toggleRush = (rush) => {
    setSelectedRush(prev => {
      if (prev.includes(rush)) return prev.filter(r => r !== rush);
      if (prev.length >= 2) return [prev[1], rush];
      return [...prev, rush];
    });
  };

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) return prev.filter(g => g !== genre);
      if (prev.length >= 3) return [...prev.slice(1), genre];
      return [...prev, genre];
    });
  };

  const handleDiscover = () => {
    let combined = [];
    if (selectedMood) {
      const moodObj = moods.find(m => m.id === selectedMood);
      if (moodObj) combined.push(moodObj.query);
    }
    if (selectedGenres.length > 0) combined.push(selectedGenres.join(' '));
    if (selectedRush.length > 0) combined.push(selectedRush.join(' '));

    const finalQuery = combined.join(' ');
    
    setShowLiveDropdown(false);

    searchMovies(finalQuery || 'best movies', {
      genres: selectedGenres,
      language: selectedLanguage,
      era: selectedEra,
      time: selectedTime,
      mood: selectedMood
    });
  };

  const renderSkeleton = () => (
    <div className="discovery-skeleton">
      <div className="skeleton-best-match"></div>
      <div className="skeleton-row">
        {[1,2,3,4,5].map(n => <div key={n} className="skeleton-card"></div>)}
      </div>
    </div>
  );

  const selectedPlatformObj = STREAMING_PLATFORMS.find(p => p.id === selectedPlatform);

  const exactPlatformMatches = selectedPlatform === 'all'
    ? movies
    : movies.filter(m => streamingAvailabilityService.isAvailableOnPlatform(m, selectedPlatform));

  const isUsingFallbackAlternatives = selectedPlatform !== 'all' && exactPlatformMatches.length === 0;

  const displayMovies = (selectedPlatform !== 'all' && exactPlatformMatches.length > 0)
    ? exactPlatformMatches
    : movies;

  const bestMatch = displayMovies[0];
  const moreMatches = displayMovies.slice(1, 6);
  const differentStyle = displayMovies.slice(6, 12);

  return (
    <div className="dataset-search-page discovery-engine-page">
      
      {onBack && <BackButton onBack={onBack} />}

      {/* HEADER SECTION WITH LIVE DROPDOWN */}
      <div className="discovery-header-area">
        <div className="discovery-title-area">
          <span className="dataset-search-label">MOVIEMIND DISCOVERY ENGINE</span>
          <h1>Let's find your perfect movie <span className="text-cyan">tonight✨</span></h1>
          <p>Tell us how you feel, and our AI will find something amazing for your mood.</p>
        </div>
        
        <div className="global-search-wrapper" ref={dropdownRef}>
          <form className="global-search-bar" onSubmit={handleGlobalSubmit}>
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search your next cinematic experience..." 
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

      {/* COMPACT TOOLBAR & QUICK FILTERS */}
      <div className="compact-explore-toolbar">
        <div className="quick-filters-row">
          <span className="quick-label">Quick Filters:</span>
          <div className="quick-pills">
            {['Action', 'Drama', 'Thriller', 'Comedy', 'Telugu', 'Sci-Fi'].map(g => {
              const isActive = g === 'Telugu' ? selectedLanguage === 'Telugu' : selectedGenres.includes(g);
              return (
                <button
                  key={g}
                  className={`quick-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (g === 'Telugu') {
                      setSelectedLanguage(selectedLanguage === 'Telugu' ? 'Any Language' : 'Telugu');
                    } else {
                      toggleGenre(g);
                    }
                  }}
                >
                  {g} {isActive && <Check size={12} style={{ display: 'inline', marginLeft: '4px' }} />}
                </button>
              );
            })}
          </div>

          <div className="action-buttons-group">
            <button 
              className={`more-filters-toggle-btn ${isFilterDrawerOpen ? 'active' : ''}`}
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            >
              <SlidersHorizontal size={15} />
              <span>More Filters</span>
              <ChevronDown size={14} className={`chevron-icon ${isFilterDrawerOpen ? 'open' : ''}`} />
            </button>

            <button className="find-perfect-btn compact-find-btn" onClick={handleDiscover}>
              <span>Find My Perfect Movie</span> <Sparkles size={16} />
            </button>
          </div>
        </div>

        {/* EXPANDABLE COMPACT FILTER DRAWER */}
        {isFilterDrawerOpen && (
          <div className="expandable-filter-drawer fade-in">
            <div className="drawer-grid">
              {/* PLATFORMS */}
              <div className="drawer-col platform-drawer-col">
                <h4><Tv size={14} /> WHERE TO WATCH PLATFORM</h4>
                <div className="drawer-pills-wrap">
                  {STREAMING_PLATFORMS.map(plat => (
                    <button
                      key={plat.id}
                      className={`drawer-pill ${selectedPlatform === plat.id ? 'active' : ''}`}
                      style={{
                        borderColor: selectedPlatform === plat.id ? plat.color : 'rgba(255,255,255,0.1)',
                        color: selectedPlatform === plat.id ? plat.color : '#cbd5e1'
                      }}
                      onClick={() => setSelectedPlatform(plat.id)}
                    >
                      {plat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* MOODS */}
              <div className="drawer-col">
                <h4><Smile size={14} /> MOOD</h4>
                <div className="drawer-pills-wrap">
                  {moods.map(m => (
                    <button
                      key={m.id}
                      className={`drawer-pill ${selectedMood === m.id ? 'active' : ''}`}
                      onClick={() => handleMoodSelect(m.id)}
                    >
                      {m.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* LANGUAGE */}
              <div className="drawer-col">
                <h4><Globe size={14} /> LANGUAGE</h4>
                <div className="drawer-pills-wrap">
                  {LANGUAGE_OPTIONS.map(l => (
                    <button
                      key={l}
                      className={`drawer-pill ${selectedLanguage === l ? 'active' : ''}`}
                      onClick={() => setSelectedLanguage(l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* RUNTIME */}
              <div className="drawer-col">
                <h4><Clock size={14} /> RUNTIME</h4>
                <div className="drawer-pills-wrap">
                  {TIME_OPTIONS.map(t => (
                    <button
                      key={t.id}
                      className={`drawer-pill ${selectedTime === t.id ? 'active' : ''}`}
                      onClick={() => setSelectedTime(t.id)}
                    >
                      {t.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: RESULTS */}
      <div ref={resultsRef} className="scroll-anchor"></div>
      
      {loading && hasSearched && (
        <section className="discovery-step-section results-section">
          <div className="step-header">
            <div className="step-number pulse">3</div>
            <div className="step-text">
              <h2>ANALYZING MOVIEMIND DATA...</h2>
              <p>Finding the perfect matches for your mood.</p>
            </div>
          </div>
          {renderSkeleton()}
        </section>
      )}

      {!loading && hasSearched && !searchError && movies.length > 0 && (
        <section className="results-section fade-in" ref={resultsRef}>
          <div className="scroll-anchor"></div>
          
          <div className="results-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#cbd5e1', letterSpacing: '1px' }}>
              {isUsingFallbackAlternatives
                ? `RECOMMENDED MOVIE ALTERNATIVES FOR YOUR MOOD`
                : selectedPlatform !== 'all'
                  ? `RECOMMENDED ON ${selectedPlatformObj?.name?.toUpperCase() || 'PLATFORM'}`
                  : `RECOMMENDED FOR YOUR MOOD & PREFERENCES`}
            </h3>
            <span className="src-ai-badge" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} /> Smart Match Engine
            </span>
          </div>

          {isUsingFallbackAlternatives && (
            <div className="platform-fallback-banner" style={{ background: 'rgba(255, 102, 0, 0.12)', border: '1px solid rgba(255, 102, 0, 0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#ffaa66', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} />
              <span>Direct streaming on <strong>{selectedPlatformObj?.name}</strong> is currently unavailable for this specific search, but here are top recommended movie alternatives for your mood & taste!</span>
            </div>
          )}

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
                
                <div className="bm-details">
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
                    <Star size={16} fill="#F5C518" color="#F5C518" />
                    <span className="rating-val">{safeString(bestMatch.rating, 'N/A')}/10</span>
                    <span className="imdb-badge">IMDb</span>
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

          <div className="ai-explanation-footer">
            <div className="ai-brand">
              <Sparkles size={28} className="text-violet" />
              <div>
                <h4>AI EXPLANATION</h4>
                <p>We analyzed your past watches, liked genres and today's mood to find movies that will give you the perfect experience.</p>
              </div>
            </div>
            <div className="ai-stats">
              <div className="stat">
                <h5 className="text-cyan">1,247</h5>
                <span>Movies Analyzed</span>
              </div>
              <div className="stat">
                <h5 className="text-violet">89</h5>
                <span>Personal Signals</span>
              </div>
              <div className="stat">
                <h5 className="text-cyan">12</h5>
                <span>AI Models Used</span>
              </div>
              <div className="stat">
                <h5 className="text-cyan">0.92s</h5>
                <span>Thinking Time</span>
              </div>
            </div>
          </div>
        </section>
      )}



      {!loading && !hasSearched && (
        <section className="discovery-step-section initial-search-prompt">
          <div className="dataset-empty" style={{ padding: '40px 20px', border: '1px border rgba(255,255,255,0.08)' }}>
            <Search size={44} className="text-cyan" style={{ marginBottom: '16px' }} />
            <h2>Search for movies, actors, genres or languages</h2>
            <p>Type in the search bar above or choose a mood to discover curated cinema.</p>
          </div>
        </section>
      )}

      {!loading && searchError && (
        <div className="dataset-empty">
          <Film size={40} className="text-red" />
          <h2>Search is temporarily unavailable</h2>
          <p>Unable to fetch search results at this moment.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn-secondary" onClick={() => searchMovies(globalQuery || 'best movies')}>
              <RefreshCw size={16} /> Try Again
            </button>
            {onBack && (
              <button className="btn-primary" onClick={onBack}>
                <Home size={16} /> Back to Home
              </button>
            )}
          </div>
        </div>
      )}

      <TrailerModal isOpen={isTrailerOpen} trailerUrl={currentTrailerUrl} onClose={closeTrailer} />
    </div>
  );
}
