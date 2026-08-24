import React, { useState } from 'react';
import {
  Home,
  TrendingUp,
  Star,
  BarChart3,
  Bookmark,
  History,
  Heart,
  Search,
  Bell,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({
  currentTab,
  onNavigate,
  onSearch
}) {
  const [query, setQuery] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const mainNav = [
    { name: 'Home', id: 'home', icon: <Home size={20} /> },
    { name: 'Search Movies', id: 'search', icon: <Search size={20} /> },
    { name: 'Trending', id: 'trending', icon: <TrendingUp size={20} /> },
    { name: 'Top Rated', id: 'top-rated', icon: <Star size={20} /> },
    { name: 'Insights', id: 'insights', icon: <BarChart3 size={20} /> }
  ];

  const libraryNav = [
    { name: 'Favourites', id: 'favourites', icon: <Heart size={20} /> },
    { name: 'Watchlist', id: 'watchlist', icon: <Bookmark size={20} /> },
    { name: 'History', id: 'history', icon: <History size={20} /> }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">M</div>
        <span className="logo-text">MovieMind</span>
      </div>

      <div className="sidebar-search">
        <Search size={18} />
        <input 
          type="text" 
          placeholder="Quick search..." 
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-section-title">DISCOVER</h3>
          <ul className="nav-list">
            {mainNav.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`nav-link ${currentTab === item.id ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-section">
          <h3 className="nav-section-title">MY LIBRARY</h3>
          <ul className="nav-list">
            {libraryNav.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`nav-link ${currentTab === item.id ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <ul className="nav-list bottom-actions">
          <li className="nav-item">
            <button className="nav-link action-link">
              <span className="nav-icon notification-icon">
                <Bell size={20} />
                <span className="dot"></span>
              </span>
              <span className="nav-text">Notifications</span>
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link action-link">
              <span className="nav-icon"><User size={20} /></span>
              <span className="nav-text">My Account</span>
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link action-link">
              <span className="nav-icon"><Settings size={20} /></span>
              <span className="nav-text">Settings</span>
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link action-link sign-out">
              <span className="nav-icon"><LogOut size={20} /></span>
              <span className="nav-text">Sign Out</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
