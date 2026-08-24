import React, { useState } from 'react';
import { Search, Clapperboard, Globe, ChevronDown } from 'lucide-react';
import './Navbar.css';

const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' }
];

export default function Navbar({
  onSearch,
  onNavigate,
  currentTab,
  language = 'te',
  onLanguageChange
}) {
  const [query, setQuery] = useState('');
  const [languageOpen, setLanguageOpen] = useState(false);

  const selectedLanguage =
    languages.find(item => item.code === language) || languages[0];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleLanguageChange = (code) => {
    onLanguageChange?.(code);
    setLanguageOpen(false);
  };

  return (
    <nav className="navbar glass-panel">

      <div
        className="navbar-left"
        onClick={() => onNavigate('home')}
        style={{ cursor: 'pointer' }}
      >
        <Clapperboard className="brand-icon" />
        <span className="brand-text">MovieMind</span>
      </div>

      <div className="navbar-center">

        <button
          className={`nav-link ${
            currentTab === 'home' ? 'active' : ''
          }`}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>

        <button
          className={`nav-link ${
            currentTab === 'discover' ? 'active' : ''
          }`}
          onClick={() => onNavigate('discover')}
        >
          Discover
        </button>

        <button
          className={`nav-link ${
            currentTab === 'insights' ? 'active' : ''
          }`}
          onClick={() => onNavigate('insights')}
        >
          AI Insights
        </button>

      </div>

      <div className="navbar-right">

        <div className="language-selector">

          <button
            type="button"
            className="language-button"
            onClick={() =>
              setLanguageOpen(prev => !prev)
            }
            aria-expanded={languageOpen}
          >
            <Globe size={17} />

            <span>
              {selectedLanguage.native}
            </span>

            <ChevronDown
              size={14}
              className={
                languageOpen
                  ? 'language-chevron open'
                  : 'language-chevron'
              }
            />
          </button>

          {languageOpen && (
            <div className="language-menu">

              <div className="language-menu-title">
                Website Language
              </div>

              {languages.map(item => (
                <button
                  key={item.code}
                  type="button"
                  className={`language-option ${
                    language === item.code
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() =>
                    handleLanguageChange(item.code)
                  }
                >
                  <span>{item.native}</span>
                  <small>{item.label}</small>
                </button>
              ))}

            </div>
          )}

        </div>

        <form
          className="search-form"
          onSubmit={handleSubmit}
        >
          <Search
            className="search-icon"
            size={18}
          />

          <input
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
          />
        </form>

      </div>

    </nav>
  );
}
