import React, { useState, useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import TasteProfilePage from './pages/TasteProfilePage';
import AIInsightsPage from './pages/AIInsightsPage';
import LibraryPage from './pages/LibraryPage';
import ProductRecommendation from './pages/ProductRecommendation';
import ProductSwitcher from './components/ProductSwitcher';
import MovieDetailsPanel from './components/MovieDetailsPanel';
import WelcomeScreen from './components/WelcomeScreen';
import AccessScreen from './components/AccessScreen';
import CinematicTransition from './components/CinematicTransition';
import ErrorBoundary from './components/ErrorBoundary';
import CinematicCursor from './components/CinematicCursor';
import { api } from './services/api';
import { movieSearchService } from './services/MovieSearchService';
import { normalizeMovie } from './utils/movieUtils';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import './App.css';

export default function App() {
  const [appState, setAppState] = useState(() => {
    try {
      const token = localStorage.getItem('moviemind_token');
      const isGuest = localStorage.getItem('moviemind_guest');
      if (token || isGuest === 'true') {
        return 'app';
      }
    } catch (e) {
      console.warn('Storage check in App init warning:', e);
    }
    return 'welcome';
  });

  const [currentTab, setCurrentTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [navHistory, setNavHistory] = useState(['home']);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, [currentTab, appState]);

  const handleNavigate = (tabId) => {
    if (tabId === currentTab) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setNavHistory((prev) => [...prev, tabId]);
    setCurrentTab(tabId);
  };

  const handleGoBack = () => {
    if (navHistory.length <= 1) return;
    const newHistory = [...navHistory];
    newHistory.pop();
    const prevTab = newHistory[newHistory.length - 1];
    setNavHistory(newHistory);
    setCurrentTab(prevTab);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() && currentTab !== 'search') {
      handleNavigate('search');
    }
  };

  const handleMovieSelect = (movie) => {
    console.log("[VIEW DETAILS] CLICK RECEIVED:", movie);
    try {
      if (!movie || typeof movie !== 'object') {
        console.warn("[VIEW DETAILS] Invalid movie object received");
        return;
      }
      setSelectedMovie(movie);
    } catch (err) {
      console.error("[VIEW DETAILS] Error opening details panel:", err);
    }
  };

  const handleAuthSuccess = () => {
    setAppState('transition');
  };

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: 'easeIn' } }
  };

  return (
    <AuthProvider>
      <CinematicCursor />
      <ToastProvider>
        <AnimatePresence mode="wait">
          {appState === 'welcome' && (
            <WelcomeScreen key="welcome" onComplete={() => setAppState('access')} />
          )}
          
          {appState === 'access' && (
            <AccessScreen key="access" onAuthSuccess={handleAuthSuccess} />
          )}

          {appState === 'transition' && (
            <CinematicTransition key="transition" onComplete={() => setAppState('app')} />
          )}
        </AnimatePresence>

      {appState === 'app' && (
        <AnimatePresence mode="wait">
          {currentTab === 'products' ? (
            <motion.div
              key="products-app-shell"
              className="products-standalone-layout"
              initial={{ opacity: 0, y: 14, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.99 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', minHeight: '100vh', background: '#050714', color: '#f8fafc' }}
            >
              <ErrorBoundary onGoHome={() => handleNavigate('home')}>
                <ProductRecommendation
                  onNavigateToMovies={() => handleNavigate('home')}
                  onNavigate={handleNavigate}
                />
              </ErrorBoundary>
            </motion.div>
          ) : (
            <motion.div 
              key="movies-app-shell"
              className="app-layout"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            >
              <Sidebar
                currentTab={currentTab}
                onNavigate={handleNavigate}
                onSearch={handleSearch}
                onAuthAction={() => setAppState('access')}
              />

              <div className="main-content-wrapper">
                <div className="top-domain-header" style={{ position: 'absolute', top: '18px', right: '28px', zIndex: 90 }}>
                  <ProductSwitcher
                    activeDomain="movies"
                    onDomainChange={(domain) => {
                      if (domain === 'products') handleNavigate('products');
                    }}
                  />
                </div>

                <main className="main-content">
                  <ErrorBoundary onGoHome={() => handleNavigate('home')}>
                    <AnimatePresence mode="wait">
                      {/* HOME + CATEGORY PAGES */}
                      {(currentTab === 'home' ||
                        currentTab === 'trending' ||
                        currentTab === 'new-releases' ||
                        currentTab === 'top-rated') && (
                        
                        <motion.div key={`cat-${currentTab}`} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                          <Home
                            searchQuery={searchQuery}
                            onMovieSelect={handleMovieSelect}
                            onBack={navHistory.length > 1 ? handleGoBack : null}
                            categoryFilter={
                              currentTab !== 'home'
                                ? currentTab
                                : null
                            }
                          />
                        </motion.div>
                      )}

                      {/* SEARCH & EXPLORE DISCOVERY DATASET */}
                      {(currentTab === 'search' || currentTab === 'explore') && (
                        <motion.div key="search-explore" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                          <SearchPage
                            initialQuery={searchQuery}
                            onMovieSelect={handleMovieSelect}
                            onBack={navHistory.length > 1 ? handleGoBack : null}
                          />
                        </motion.div>
                      )}

                      {/* TASTE PROFILE PAGE */}
                      {(currentTab === 'taste-profile' || currentTab === 'insights') && (
                        <motion.div key="taste-profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                          <TasteProfilePage onBack={navHistory.length > 1 ? handleGoBack : null} />
                        </motion.div>
                      )}

                      {/* AI RECOMMENDATION INSIGHTS LAB PAGE */}
                      {currentTab === 'ai-insights' && (
                        <motion.div key="ai-insights" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                          <AIInsightsPage onBack={navHistory.length > 1 ? handleGoBack : null} />
                        </motion.div>
                      )}

                      {/* MY LIBRARY */}
                      {(currentTab === 'favourites' ||
                        currentTab === 'watchlist' ||
                        currentTab === 'history') && (
                        
                        <motion.div key={`lib-${currentTab}`} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                          <LibraryPage
                            type={currentTab}
                            onMovieSelect={handleMovieSelect}
                            onBack={navHistory.length > 1 ? handleGoBack : null}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ErrorBoundary>
                </main>
              </div>

              {/* MOVIE DETAILS */}
              <ErrorBoundary onGoHome={() => setSelectedMovie(null)}>
                <MovieDetailsPanel
                  movie={selectedMovie}
                  isOpen={Boolean(selectedMovie)}
                  onClose={() => setSelectedMovie(null)}
                  onMovieSelect={handleMovieSelect}
                />
              </ErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      </ToastProvider>
    </AuthProvider>
  );
}
