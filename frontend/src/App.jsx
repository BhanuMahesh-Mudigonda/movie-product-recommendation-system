import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Insights from './pages/Insights';
import LibraryPage from './pages/LibraryPage';
import SearchPage from './pages/SearchPage';
import MovieDetailsPanel from './components/MovieDetailsPanel';
import WelcomeScreen from './components/WelcomeScreen';
import AccessScreen from './components/AccessScreen';
import CinematicTransition from './components/CinematicTransition';
import { api } from './services/api';
import { ToastProvider } from './components/Toast';
import './App.css';

export default function App() {
  const [appState, setAppState] = useState('welcome'); // welcome, access, transition, app
  const [currentTab, setCurrentTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleNavigate = (tab) => {
    setCurrentTab(tab);
    setSearchQuery('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSearch = (query) => {
    setCurrentTab('search');
    setSearchQuery(query);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleMovieSelect = async (movie) => {

    // Open immediately with available data
    setSelectedMovie(movie);

    try {

      const hasFullDetails =
        movie?.poster ||
        movie?.Poster ||
        movie?.actors ||
        movie?.Actors ||
        movie?.plot ||
        movie?.Plot;

      // Already enriched — no external lookup needed
      if (hasFullDetails) {
        return;
      }

      const title =
        movie?.title ||
        movie?.Title ||
        movie?.name;

      if (!title) {
        return;
      }

      // Fetch full details only when user clicks this movie
      const result =
        await api.universalMovieSearch(title);

      if (
        result?.found &&
        result?.movie
      ) {

        setSelectedMovie({
          ...movie,
          ...result.movie
        });

      }

    } catch (error) {

      console.error(
        'Failed to load full movie details:',
        error
      );

    }

  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <ToastProvider>
      <AnimatePresence mode="wait">
        {appState === 'welcome' && (
          <WelcomeScreen key="welcome" onComplete={() => setAppState('access')} />
        )}
        
        {appState === 'access' && (
          <AccessScreen key="access" onGuestEntry={() => setAppState('transition')} />
        )}

        {appState === 'transition' && (
          <CinematicTransition key="transition" onComplete={() => setAppState('app')} />
        )}
      </AnimatePresence>

      {appState === 'app' && (
        <motion.div 
          className="app-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >

          <Sidebar
            currentTab={currentTab}
            onNavigate={handleNavigate}
            onSearch={handleSearch}
          />

          <div className="main-content-wrapper">

            <main className="main-content">
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
                      categoryFilter={
                        currentTab !== 'home'
                          ? currentTab
                          : null
                      }
                    />
                  </motion.div>
                )}

                {/* SEARCH DATASET */}
                {currentTab === 'search' && (
                  <motion.div key="search" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <SearchPage
                      initialQuery={searchQuery}
                      onMovieSelect={handleMovieSelect}
                    />
                  </motion.div>
                )}

                {/* INSIGHTS */}
                {currentTab === 'insights' && (
                  <motion.div key="insights" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <Insights />
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
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

          </div>

          {/* MOVIE DETAILS */}
          <MovieDetailsPanel
            movie={selectedMovie}
            isOpen={!!selectedMovie}
            onClose={() => setSelectedMovie(null)}
            onMovieSelect={handleMovieSelect}
          />

        </motion.div>
      )}
    </ToastProvider>
  );
}
