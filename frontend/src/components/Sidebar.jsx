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
  LogIn,
  LogOut,
  Flame,
  Compass,
  Activity,
  Sparkles,
  Clock,
  UserCheck,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({
  currentTab,
  onNavigate,
  onSearch,
  onAuthAction
}) {
  const [query, setQuery] = useState('');
  const { user, logout } = useAuth();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const handleLogout = () => {
    logout();
    onAuthAction?.();
  };

  const discoverNav = [
    { name: 'Home', id: 'home', icon: <Home size={18} /> },
    { name: 'Explore', id: 'search', icon: <Compass size={18} /> },
    { name: 'Trending', id: 'trending', icon: <Flame size={18} /> },
    { name: 'Top Rated', id: 'top-rated', icon: <Sparkles size={18} /> }
  ];

  const myCinemaNav = [
    { name: 'Favourites', id: 'favourites', icon: <Heart size={18} /> },
    { name: 'Watchlist', id: 'watchlist', icon: <Bookmark size={18} /> },
    { name: 'History', id: 'history', icon: <Clock size={18} /> }
  ];

  const intelligenceNav = [
    { name: 'My Taste Profile', id: 'taste-profile', icon: <UserCheck size={18} /> },
    { name: 'AI Recommendation Insights', id: 'ai-insights', icon: <Activity size={18} /> }
  ];

  return (
    <aside className="sidebar">
      {/* SIDEBAR HEADER BRANDING */}
      <div className="sidebar-logo">
        <div className="sidebar-emblem-m">
          <span className="m-letter">M</span>
        </div>
        <div className="logo-text">
          <span className="logo-main"><span className="text-movie">MOVIE</span><span className="text-mind">MIND</span></span>
          <span className="logo-sub">CINEMATIC AI</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="sidebar-search">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          placeholder="Search universe..."
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      {/* DISCOVER SECTION */}
      <div className="nav-section">
        <div className="nav-section-title">DISCOVER</div>
        {discoverNav.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* MY CINEMA SECTION */}
      <div className="nav-section">
        <div className="nav-section-title">MY CINEMA</div>
        {myCinemaNav.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* INTELLIGENCE SECTION */}
      <div className="nav-section">
        <div className="nav-section-title">INTELLIGENCE</div>
        {intelligenceNav.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* USER FOOTER / AUTH */}
      <div className="sidebar-footer">
        {user ? (
          <div className="user-profile">
            <div className="user-avatar">{user.name?.[0] || 'D'}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn-primary full-width" onClick={onAuthAction}>
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
}
