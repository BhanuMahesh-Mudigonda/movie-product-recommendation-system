import React from 'react';
import { motion } from 'framer-motion';
import { Film, ShoppingBag } from 'lucide-react';
import './ProductSwitcher.css';

export default function ProductSwitcher({ activeDomain = 'movies', onDomainChange }) {
  return (
    <div className="product-switcher-container">
      <div className="product-switcher-pill">
        <button
          type="button"
          className={`switcher-btn ${activeDomain === 'movies' ? 'active' : ''}`}
          onClick={() => onDomainChange?.('movies')}
          aria-label="Switch to Movie Recommendations"
        >
          {activeDomain === 'movies' && (
            <motion.div
              layoutId="switcher-glow"
              className="switcher-active-bg movies-bg"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="switcher-content">
            <Film size={15} className="switcher-icon" />
            <span className="switcher-label">MOVIES</span>
          </span>
        </button>

        <button
          type="button"
          className={`switcher-btn ${activeDomain === 'products' ? 'active' : ''}`}
          onClick={() => onDomainChange?.('products')}
          aria-label="Switch to Product Recommendations"
        >
          {activeDomain === 'products' && (
            <motion.div
              layoutId="switcher-glow"
              className="switcher-active-bg products-bg"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="switcher-content">
            <ShoppingBag size={15} className="switcher-icon" />
            <span className="switcher-label">PRODUCTS</span>
            <span className="switcher-badge">AI</span>
          </span>
        </button>
      </div>
    </div>
  );
}
