import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  ShoppingBag,
  Heart,
  X,
  ArrowLeft,
  ExternalLink,
  Star,
  RefreshCw,
  Cpu,
  Shirt,
  Grid,
  TrendingUp,
  Zap,
  Check,
  ChevronRight,
  Headphones,
  Smartphone,
  Watch,
  Activity,
  Layers
} from 'lucide-react';
import productApi from '../services/productApi';
import ProductSwitcher from '../components/ProductSwitcher';
import './ProductRecommendation.css';

// Price Formatter in INR (₹)
const formatMoney = (value, department) => {
  const num = Number(value);
  if (!num || isNaN(num)) return 'Price unavailable';
  const inrValue = (department === 'Apparel' || num < 200) ? num * 83 : num;
  return `₹${Math.round(inrValue).toLocaleString('en-IN')}`;
};

// Fallback Image Helper
const getFallbackImage = (product = {}) => {
  const title = String(product.title || '').toLowerCase();
  const dept = String(product.department || '').toLowerCase();

  if (title.includes('phone') || title.includes('mobile') || title.includes('iphone') || title.includes('samsung') || title.includes('narzo') || title.includes('oneplus') || title.includes('realme')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80';
  }
  if (title.includes('laptop') || title.includes('macbook') || title.includes('computer') || title.includes('desktop')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80';
  }
  if (title.includes('earbud') || title.includes('headphone') || title.includes('sound') || title.includes('audio') || title.includes('airpods') || title.includes('neckband') || title.includes('speaker') || title.includes('buds')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80';
  }
  if (title.includes('watch') || title.includes('band') || title.includes('smartwatch') || title.includes('wearable')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';
  }
  if (dept.includes('apparel') || title.includes('shirt') || title.includes('polo') || title.includes('jacket') || title.includes('pant') || title.includes('t-shirt') || title.includes('tee') || title.includes('cotton')) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80';
};

const handleImgError = (evt, product) => {
  evt.target.onerror = null;
  evt.target.src = getFallbackImage(product);
};

const popularSearches = [
  'Samsung Galaxy',
  'OnePlus Nord',
  'boAt Airdopes',
  'Smart Watch',
  'Apple iPhone',
  'Mens Polo Shirts'
];

const placeholderPrompts = [
  'Find premium wireless earbuds under ₹5000...',
  'Show me the best Samsung Galaxy phones...',
  'Discover smart watches for everyday use...',
  'Recommend stylish polo shirts...'
];

const formatMatchScore = (score, index) => {
  if (typeof score === 'number' && score > 0) {
    const pct = Math.min(99, Math.max(70, Math.round(score * 100)));
    return `${pct}% MATCH`;
  }
  const fallbackPct = Math.max(75, 98 - (index || 0) * 3);
  return `${fallbackPct}% MATCH`;
};

// Motion Stagger Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function ProductRecommendation({ onNavigateToMovies }) {
  const [activeDepartment, setActiveDepartment] = useState('All'); // 'All' | 'Electronics' | 'Apparel'
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentResultTitle, setCurrentResultTitle] = useState('Recommended For You');

  // Dynamic Category Totals
  const [categoryCounts, setCategoryCounts] = useState({
    Electronics: 9512,
    Apparel: 728,
    All: 10240
  });

  // Animated Placeholder Rotation
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Selected Product Modal & Similar Products
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Session Activity Tracking State
  const [sessionStats, setSessionStats] = useState(() => {
    try {
      const saved = sessionStorage.getItem('smart_session_stats');
      return saved ? JSON.parse(saved) : { electronics: 65, audio: 45, fashion: 30 };
    } catch {
      return { electronics: 65, audio: 45, fashion: 30 };
    }
  });

  // Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const resultsRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('smart_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  // Load dynamic category totals on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCategoryCounts() {
      try {
        const [healthRes, allRes, elecRes, appRes] = await Promise.allSettled([
          productApi.getHealth(),
          productApi.getProducts(null, 1),
          productApi.getProducts('Electronics', 1),
          productApi.getProducts('Apparel', 1)
        ]);

        if (!isMounted) return;

        const elecTotal = elecRes.status === 'fulfilled' && elecRes.value?.total ? elecRes.value.total : 9512;
        const appTotal = appRes.status === 'fulfilled' && appRes.value?.total ? appRes.value.total : 728;
        const allTotal = allRes.status === 'fulfilled' && allRes.value?.total
          ? allRes.value.total
          : (healthRes.status === 'fulfilled' && healthRes.value?.products ? healthRes.value.products : elecTotal + appTotal);

        setCategoryCounts({
          Electronics: elecTotal,
          Apparel: appTotal,
          All: allTotal
        });
      } catch (e) {
        console.warn('Dynamic category count load warning:', e);
      }
    }
    loadCategoryCounts();
    return () => { isMounted = false; };
  }, []);

  // Rotate placeholder text when query is empty
  useEffect(() => {
    if (searchQuery.trim().length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderPrompts.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [searchQuery]);

  // Track session stats
  const trackSessionInteraction = (categoryKey) => {
    setSessionStats((prev) => {
      const updated = {
        ...prev,
        [categoryKey]: Math.min(95, (prev[categoryKey] || 40) + 10)
      };
      try {
        sessionStorage.setItem('smart_session_stats', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  // Main Data Fetch Function
  const fetchProductData = async (queryText = searchQuery, deptName = activeDepartment) => {
    setLoading(true);
    setProducts([]); // Clear old items immediately for smooth skeleton load
    try {
      const targetDept = deptName === 'All' ? null : deptName;
      const cleanQuery = queryText.trim();

      if (cleanQuery.length >= 2) {
        // TF-IDF Search Recommendation
        const res = await productApi.recommendProducts(cleanQuery, targetDept, 16);
        setProducts(res.results || []);
        setTotalCount(res.results?.length || 0);
        setError(null);
      } else {
        // Standard Catalog GET
        const res = await productApi.getProducts(targetDept, 24);
        setProducts(res.products || []);
        setTotalCount(res.total || res.products?.length || 0);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching product data:', err);
      setError('Unable to connect to Product Recommendation Service.');
    } finally {
      setLoading(false);
    }
  };

  // Initial mount health check and load
  useEffect(() => {
    let isMounted = true;
    async function checkHealthAndLoad() {
      const health = await productApi.getHealth();
      if (!isMounted) return;
      if (health.isHealthy) {
        setError(null);
      }
      fetchProductData(searchQuery, activeDepartment);
    }
    checkHealthAndLoad();
    return () => {
      isMounted = false;
    };
  }, []);

  // Category Tab / Universe Card Click Handler
  const handleDepartmentChange = (dept, shouldScroll = false) => {
    setActiveDepartment(dept);
    if (dept === 'Electronics') trackSessionInteraction('electronics');
    else if (dept === 'Apparel') trackSessionInteraction('fashion');

    let newTitle = 'Recommended For You';
    if (dept === 'Electronics') {
      newTitle = searchQuery.trim().length >= 2
        ? `Electronics Results for "${searchQuery.trim()}"`
        : "Explore Tomorrow's Technology";
    } else if (dept === 'Apparel') {
      newTitle = searchQuery.trim().length >= 2
        ? `Fashion Results for "${searchQuery.trim()}"`
        : 'Discover Your Signature Style';
    } else if (searchQuery.trim().length >= 2) {
      newTitle = `Results for "${searchQuery.trim()}"`;
    } else {
      newTitle = 'Curated Intelligence For You';
    }
    setCurrentResultTitle(newTitle);

    fetchProductData(searchQuery, dept);

    if (shouldScroll && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Search submit (AI Search button or Enter key)
  const handleSearch = (overrideQuery) => {
    const q = typeof overrideQuery === 'string' ? overrideQuery : searchQuery;
    const cleanQ = q.trim();

    if (cleanQ.toLowerCase().includes('audio') || cleanQ.toLowerCase().includes('earbud')) {
      trackSessionInteraction('audio');
    } else if (cleanQ.toLowerCase().includes('phone') || cleanQ.toLowerCase().includes('samsung')) {
      trackSessionInteraction('electronics');
    } else if (cleanQ.toLowerCase().includes('shirt') || cleanQ.toLowerCase().includes('polo')) {
      trackSessionInteraction('fashion');
    }

    let newTitle = 'Recommended For You';
    if (cleanQ.length >= 2) {
      if (activeDepartment === 'Electronics') {
        newTitle = `Electronics Results for "${cleanQ}"`;
      } else if (activeDepartment === 'Apparel') {
        newTitle = `Fashion Results for "${cleanQ}"`;
      } else {
        newTitle = `AI Recommendations for "${cleanQ}"`;
      }
    } else {
      if (activeDepartment === 'Electronics') newTitle = "Explore Tomorrow's Technology";
      else if (activeDepartment === 'Apparel') newTitle = 'Discover Your Signature Style';
    }
    setCurrentResultTitle(newTitle);

    fetchProductData(cleanQ, activeDepartment);

    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    handleSearch(searchQuery);
  };

  // Suggestion Chip Click Handler
  const handleSuggestionClick = (chipText) => {
    setSearchQuery(chipText);
    handleSearch(chipText);
  };

  // Intent Card Click Handler
  const handleIntentClick = (intentType, queryVal, deptVal) => {
    if (deptVal) setActiveDepartment(deptVal);
    if (queryVal) setSearchQuery(queryVal);
    handleSearch(queryVal || '');
  };

  const handleToggleWishlist = (asin) => {
    setWishlist((prev) =>
      prev.includes(asin) ? prev.filter((id) => id !== asin) : [...prev, asin]
    );
  };

  const handleOpenDetails = async (product) => {
    setSelectedProduct(product);
    setSimilarProducts([]);
    setLoadingSimilar(true);
    try {
      const res = await productApi.getSimilarProducts(product.asin, 6);
      setSimilarProducts(res.results || []);
    } catch (err) {
      console.error('Error fetching similar products:', err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Dynamic Theme Class
  const themeClass = activeDepartment === 'Electronics'
    ? 'theme-electronics'
    : activeDepartment === 'Apparel'
    ? 'theme-apparel'
    : '';

  return (
    <div className={`smart-standalone-app ${themeClass}`}>
      {/* Background Layers */}
      <div className="smart-bg-layers">
        <div className="smart-bg-gradient-glow" />
        <div className="smart-bg-grid-overlay" />
      </div>

      {/* Standalone Master Header Navbar */}
      <header className="smart-master-header">
        <div className="smart-brand-group" onClick={onNavigateToMovies}>
          <div className="smart-brand-icon">
            <ShoppingBag size={22} />
          </div>
          <div>
            <div className="smart-brand-title">
              Smart<span>Recommend</span>
            </div>
            <div className="smart-brand-subtitle">AI Commerce Intelligence</div>
          </div>
        </div>

        <div className="smart-header-right">
          {/* Domain Switcher */}
          <ProductSwitcher
            activeDomain="products"
            onDomainChange={(domain) => {
              if (domain === 'movies') onNavigateToMovies();
            }}
          />

          <button
            type="button"
            className="smart-wishlist-trigger"
            onClick={() => setIsWishlistOpen(true)}
          >
            <Heart size={16} fill={wishlist.length > 0 ? '#818cf8' : 'none'} />
            <span>Wishlist</span>
            {wishlist.length > 0 && (
              <span className="smart-wishlist-badge">{wishlist.length}</span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        className="smart-hero-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="smart-hero-tag">
          <Sparkles size={14} />
          <span>TF-IDF Content Vector Intelligence</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="smart-hero-headline">
          Discover What <span>Fits You.</span>
        </motion.h1>
        <motion.p variants={itemVariants} className="smart-hero-subtext">
          AI-powered product recommendations across technology and fashion, powered by intelligent vector similarity.
        </motion.p>

        {/* AI Command Search Box */}
        <motion.form variants={itemVariants} className="smart-command-search-box" onSubmit={handleFormSubmit}>
          <div className="smart-command-search-input-wrap">
            <Sparkles size={20} className="smart-search-icon-spin" />
            <input
              type="text"
              className="smart-command-input"
              placeholder={placeholderPrompts[placeholderIndex]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="smart-command-submit-btn">
              <Zap size={16} />
              <span>✦ AI SEARCH</span>
            </button>
          </div>
        </motion.form>

        {/* Suggestion Chips */}
        <motion.div variants={itemVariants} className="smart-suggestions-bar">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Try Searching:</span>
          {popularSearches.map((tag) => (
            <button
              key={tag}
              type="button"
              className="smart-suggestion-chip"
              onClick={() => handleSuggestionClick(tag)}
            >
              {tag}
            </button>
          ))}
        </motion.div>
      </motion.section>

      {/* Section: Explore The Universe Category Cards */}
      <section className="smart-universe-section">
        <div className="smart-universe-header">
          <h2 className="smart-universe-title">EXPLORE THE UNIVERSE</h2>
        </div>

        <div className="smart-universe-cards-grid">
          {/* Electronics Card */}
          <div
            className={`smart-universe-card card-tech ${activeDepartment === 'Electronics' ? 'active' : ''}`}
            onClick={() => handleDepartmentChange('Electronics', true)}
          >
            <div className="smart-u-icon">
              <Zap size={24} />
            </div>
            <div className="smart-u-name">ELECTRONICS</div>
            <div className="smart-u-count">{categoryCounts.Electronics.toLocaleString()} PRODUCTS</div>
            <div className="smart-u-cta">
              <span>Explore the future</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {/* Fashion & Apparel Card */}
          <div
            className={`smart-universe-card card-fashion ${activeDepartment === 'Apparel' ? 'active' : ''}`}
            onClick={() => handleDepartmentChange('Apparel', true)}
          >
            <div className="smart-u-icon">
              <Shirt size={24} />
            </div>
            <div className="smart-u-name">FASHION & APPAREL</div>
            <div className="smart-u-count">{categoryCounts.Apparel.toLocaleString()} STYLES</div>
            <div className="smart-u-cta">
              <span>Discover your style</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {/* All Discoveries Card */}
          <div
            className={`smart-universe-card card-all ${activeDepartment === 'All' ? 'active' : ''}`}
            onClick={() => handleDepartmentChange('All', true)}
          >
            <div className="smart-u-icon">
              <Grid size={24} />
            </div>
            <div className="smart-u-name">ALL DISCOVERIES</div>
            <div className="smart-u-count">{categoryCounts.All.toLocaleString()} TOTAL ITEMS ACROSS ALL CATEGORIES</div>
            <div className="smart-u-cta">
              <span>Explore everything</span>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Results Workspace */}
      <main className="smart-results-workspace" ref={resultsRef}>
        {/* Curation Engine Header */}
        <div className="smart-curation-header">
          <div>
            <div className="smart-curation-badge">AI CURATION ENGINE</div>
            <h2 className="smart-curation-title">
              {currentResultTitle}
            </h2>
          </div>

          <div className="smart-ai-status-tag">
            {loading ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>ANALYZING CATALOGUE</span>
              </>
            ) : (
              <>
                <Check size={12} />
                <span>{products.length} MATCHES DISCOVERED</span>
              </>
            )}
          </div>
        </div>

        {error && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ color: '#f43f5e', marginBottom: '8px' }}>Backend Connection Issue</h3>
            <p>{error}</p>
            <button
              type="button"
              className="smart-command-submit-btn"
              style={{ margin: '20px auto 0 auto' }}
              onClick={() => fetchProductData(searchQuery, activeDepartment)}
            >
              <RefreshCw size={16} /> Retry Connection
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="smart-products-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="smart-skeleton-card" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛍</div>
            <h3>No products found</h3>
            <p>Try searching for another query or select a different category tab.</p>
          </div>
        ) : (
          <motion.div
            className="smart-products-grid"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {products.map((product, idx) => {
              const wished = wishlist.includes(product.asin);
              return (
                <motion.div
                  key={product.asin || idx}
                  className="smart-card"
                  variants={itemVariants}
                >
                  <div className="smart-card-top-badges">
                    <div className="smart-match-badge">
                      <span>✦</span>
                      {formatMatchScore(product.score, idx)}
                    </div>

                    <button
                      type="button"
                      className={`smart-wish-icon-btn ${wished ? 'wished' : ''}`}
                      onClick={() => handleToggleWishlist(product.asin)}
                      aria-label="Toggle Wishlist"
                    >
                      <Heart size={16} fill={wished ? '#f43f5e' : 'none'} />
                    </button>
                  </div>

                  <div className="smart-img-container">
                    <img
                      src={product.image_url || getFallbackImage(product)}
                      alt={product.title}
                      onError={(e) => handleImgError(e, product)}
                      loading="lazy"
                    />
                  </div>

                  <div className="smart-card-body">
                    <div className="smart-brand-tag">
                      {product.department || 'Product'} • {product.brand || 'Brand'}
                    </div>

                    <h3 className="smart-card-title" title={product.title}>
                      {product.title}
                    </h3>

                    {product.rating > 0 && (
                      <div className="smart-card-rating">
                        <Star size={14} fill="#f59e0b" />
                        <span>{Number(product.rating).toFixed(1)}</span>
                        <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                          ({product.rating_count_num || 0} reviews)
                        </span>
                      </div>
                    )}

                    <div className="smart-card-footer">
                      <span className="smart-price-tag">
                        {formatMoney(product.price, product.department)}
                      </span>

                      <button
                        type="button"
                        className="smart-details-btn"
                        onClick={() => handleOpenDetails(product)}
                      >
                        Explore Product →
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* Section: Explore By Intent */}
      <section className="smart-intents-section">
        <div className="smart-curation-badge">SHOP BY DISCOVERY INTENT</div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>
          EXPLORE BY INTENT
        </h2>

        <div className="smart-intents-grid">
          <div
            className="smart-intent-card"
            onClick={() => handleIntentClick('audio', 'wireless earbuds', 'Electronics')}
          >
            <Headphones className="smart-intent-icon" style={{ color: '#38bdf8' }} />
            <div className="smart-intent-name">Audio & Sound</div>
            <div className="smart-intent-sub">Earbuds, headphones & speakers</div>
          </div>

          <div
            className="smart-intent-card"
            onClick={() => handleIntentClick('mobile', '5G smartphone', 'Electronics')}
          >
            <Smartphone className="smart-intent-icon" style={{ color: '#818cf8' }} />
            <div className="smart-intent-name">Smartphones & Tech</div>
            <div className="smart-intent-sub">Latest 5G mobile devices</div>
          </div>

          <div
            className="smart-intent-card"
            onClick={() => handleIntentClick('wearable', 'smart watch', 'Electronics')}
          >
            <Watch className="smart-intent-icon" style={{ color: '#06b6d4' }} />
            <div className="smart-intent-name">Smart Wearables</div>
            <div className="smart-intent-sub">Fitness bands & watches</div>
          </div>

          <div
            className="smart-intent-card"
            onClick={() => handleIntentClick('fashion', 'polo shirt', 'Apparel')}
          >
            <Shirt className="smart-intent-icon" style={{ color: '#c084fc' }} />
            <div className="smart-intent-name">Everyday Fashion</div>
            <div className="smart-intent-sub">Classic polos & casual apparel</div>
          </div>
        </div>
      </section>

      {/* Section: Session AI Insights */}
      <section className="smart-insight-panel">
        <div className="smart-insight-box">
          <div className="smart-insight-header">
            <Activity size={22} style={{ color: 'var(--sr-theme-accent)' }} />
            <span>SMARTRECOMMEND SESSION INSIGHT</span>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Based on your interactions during this session, your discovery preferences align with:
          </p>

          <div className="smart-insight-bar-group">
            <div className="smart-insight-bar-item">
              <span style={{ width: '100px', fontWeight: 700 }}>Electronics</span>
              <div className="smart-insight-bar-bg">
                <div className="smart-insight-bar-fill" style={{ width: `${sessionStats.electronics}%` }} />
              </div>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>{sessionStats.electronics}%</span>
            </div>

            <div className="smart-insight-bar-item">
              <span style={{ width: '100px', fontWeight: 700 }}>Audio & Tech</span>
              <div className="smart-insight-bar-bg">
                <div className="smart-insight-bar-fill" style={{ width: `${sessionStats.audio}%` }} />
              </div>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>{sessionStats.audio}%</span>
            </div>

            <div className="smart-insight-bar-item">
              <span style={{ width: '100px', fontWeight: 700 }}>Fashion</span>
              <div className="smart-insight-bar-bg">
                <div className="smart-insight-bar-fill" style={{ width: `${sessionStats.fashion}%` }} />
              </div>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>{sessionStats.fashion}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <div
            className="smart-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedProduct(null);
            }}
          >
            <motion.div
              className="smart-modal-container"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <button
                type="button"
                className="smart-modal-close"
                onClick={() => setSelectedProduct(null)}
              >
                <X size={20} />
              </button>

              <div className="smart-modal-grid">
                <div className="smart-modal-img">
                  <img
                    src={selectedProduct.image_url || getFallbackImage(selectedProduct)}
                    alt={selectedProduct.title}
                    onError={(e) => handleImgError(e, selectedProduct)}
                  />
                </div>

                <div className="smart-modal-info">
                  <span className="smart-brand-tag">
                    {selectedProduct.department} • {selectedProduct.brand}
                  </span>

                  <h2 className="smart-modal-title">{selectedProduct.title}</h2>

                  <div className="smart-modal-price">
                    {formatMoney(selectedProduct.price, selectedProduct.department)}
                  </div>

                  <p className="smart-modal-desc">
                    {selectedProduct.description || 'No detailed description available for this item.'}
                  </p>

                  <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    {selectedProduct.product_url && (
                      <a
                        href={selectedProduct.product_url}
                        target="_blank"
                        rel="noreferrer"
                        className="smart-command-submit-btn"
                        style={{ textDecoration: 'none' }}
                      >
                        <span>Buy / Visit Store</span>
                        <ExternalLink size={16} />
                      </a>
                    )}

                    <button
                      type="button"
                      className="smart-details-btn"
                      style={{ padding: '12px 22px', borderRadius: '9999px' }}
                      onClick={() => handleToggleWishlist(selectedProduct.asin)}
                    >
                      <Heart
                        size={16}
                        fill={wishlist.includes(selectedProduct.asin) ? '#f43f5e' : 'none'}
                        style={{ display: 'inline', marginRight: '6px' }}
                      />
                      {wishlist.includes(selectedProduct.asin) ? 'Wishlisted' : 'Add to Wishlist'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Similar Products Section */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} style={{ color: 'var(--sr-theme-accent)' }} />
                  <span>AI Similar Matches</span>
                </h3>

                {loadingSimilar ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading similar items...</p>
                ) : similarProducts.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No similar products found.</p>
                ) : (
                  <div className="smart-similar-grid">
                    {similarProducts.map((item) => (
                      <div
                        key={item.asin}
                        className="smart-similar-card"
                        onClick={() => handleOpenDetails(item)}
                      >
                        <img
                          src={item.image_url || getFallbackImage(item)}
                          alt={item.title}
                          onError={(e) => handleImgError(e, item)}
                        />
                        <p>{item.title}</p>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--sr-theme-accent)' }}>
                          {formatMoney(item.price, item.department)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wishlist Side Drawer */}
      <AnimatePresence>
        {isWishlistOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 220,
              background: 'rgba(5, 7, 20, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsWishlistOpen(false);
            }}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                width: '100%',
                maxWidth: '420px',
                height: '100%',
                background: '#0f162b',
                borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800 }}>
                  Your Wishlist ({wishlist.length})
                </h2>
                <button
                  type="button"
                  className="smart-modal-close"
                  onClick={() => setIsWishlistOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {wishlist.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', marginTop: '40px' }}>
                    Your wishlist is empty.
                  </p>
                ) : (
                  products
                    .filter((p) => wishlist.includes(p.asin))
                    .map((p) => (
                      <div
                        key={p.asin}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          background: 'rgba(14, 20, 40, 0.6)',
                          padding: '12px',
                          borderRadius: '14px',
                          border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}
                      >
                        <img
                          src={p.image_url || getFallbackImage(p)}
                          alt={p.title}
                          onError={(e) => handleImgError(e, p)}
                          style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--sr-theme-accent)', fontWeight: 800 }}>
                            {formatMoney(p.price, p.department)}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="smart-wish-icon-btn wished"
                          onClick={() => handleToggleWishlist(p.asin)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
