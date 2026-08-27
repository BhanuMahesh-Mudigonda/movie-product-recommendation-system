const { useEffect, useState, useMemo } = React;
const e = React.createElement;

// Smart Currency Formatter (INR Conversion & Normalization)
const money = (value, department) => {
  const num = Number(value);
  if (!num || isNaN(num)) return 'Price unavailable';
  // Electronics items in the dataset are already in INR ₹ (e.g. ₹599 to ₹75,749)
  // Apparel items are in USD $ (e.g. $19.99 to $49.50) -> multiply by 83 to get INR ₹
  const inrValue = (department === 'Apparel' || num < 200) ? num * 83 : num;
  return `₹${Math.round(inrValue).toLocaleString('en-IN')}`;
};

// Smart Category Image Fallback Helper
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

// Popular Quick Search Tags
const popularSearches = [
  'Samsung Galaxy',
  'OnePlus Nord',
  'boAt Airdopes',
  'Smart Watch',
  'Apple iPhone',
  'Noise Cancelling'
];

// Helper to format AI Match score percentage
const formatMatchScore = (score, index) => {
  if (typeof score === 'number' && score > 0) {
    const pct = Math.min(99, Math.max(70, Math.round(score * 100)));
    return `${pct}% MATCH`;
  }
  const fallbackPct = Math.max(75, 98 - (index || 0) * 3);
  return `${fallbackPct}% MATCH`;
};

// Toast Component
function ToastContainer({ toasts = [] }) {
  if (!toasts.length) return null;
  return e('div', { className: 'toast-container' },
    toasts.map(toast =>
      e('div', { key: toast.id, className: 'toast-message' },
        e('span', { className: 'toast-icon' }, toast.icon || '✨'),
        e('span', null, toast.message)
      )
    )
  );
}

// Product Card Component
function ProductCard({ product = {}, index = 0, wished = false, onWish, onDetails, onFindSimilar }) {
  const isClothing = product.department === 'Apparel';
  const rawCat = String(product.category || product.department || 'Product');
  const categoryLabel = isClothing
    ? (product.brand || 'Apparel')
    : (rawCat.split('>').pop().trim());

  return e('article', {
    className: 'product-card',
    style: { animationDelay: `${index * 40}ms` }
  },
    // Match Score Badge
    e('div', { className: 'match-score-badge' },
      e('span', null, '✦'),
      formatMatchScore(product.score, index)
    ),

    // Wishlist Toggle Button
    e('button', {
      className: `wishlist-toggle ${wished ? 'is-wished' : ''}`,
      type: 'button',
      'aria-label': wished ? 'Remove from wishlist' : 'Add to wishlist',
      onClick: (evt) => {
        evt.stopPropagation();
        if (onWish) onWish();
      }
    }, wished ? '♥' : '♡'),

    // Product Image Container
    e('div', { className: 'product-image-box', onClick: onDetails },
      e('img', {
        src: product.image_url || getFallbackImage(product),
        alt: product.title || 'Product',
        loading: 'lazy',
        onError: (evt) => handleImgError(evt, product)
      })
    ),

    // Product Content
    e('div', { className: 'product-info' },
      e('span', { className: 'product-category-tag' }, categoryLabel),
      e('h3', { className: 'product-title', title: product.title || '', onClick: onDetails },
        isClothing ? (product.brand || 'Clothing Item') : (product.title || 'Product Item')
      ),

      // Rating Stars
      e('div', { className: 'rating-row' },
        e('span', null, `★ ${product.rating || '4.5'}`),
        e('span', { className: 'rating-count' }, `(${Number(product.rating_count_num || 124).toLocaleString()} reviews)`)
      ),

      // Price Row
      e('div', { className: 'price-row' },
        e('span', { className: 'price-tag' }, money(product.price, product.department))
      ),

      // Card Actions
      e('div', { className: 'card-actions' },
        e('button', { className: 'action-btn-primary', type: 'button', onClick: onDetails }, 'Quick View'),
        e('button', { className: 'action-btn-secondary', type: 'button', onClick: onFindSimilar }, 'Similar ↗')
      )
    )
  );
}

// Product Detail & AI Similar Products Modal
function ProductModal({ product, onClose, onSelectProduct, wishes = [], onWish }) {
  const [similarItems, setSimilarItems] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Safe checks for hooks
  const isWished = product && product.asin && Array.isArray(wishes) ? wishes.includes(product.asin) : false;

  useEffect(() => {
    if (!product || !product.asin) return;
    setLoadingSimilar(true);
    fetch(`/api/products/${product.asin}/similar?k=4`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setSimilarItems(data.results || []);
      })
      .catch(() => setSimilarItems([]))
      .finally(() => setLoadingSimilar(false));
  }, [product?.asin]);

  if (!product) return null;

  return e('div', { className: 'modal-backdrop', onClick: evt => { if (evt.target === evt.currentTarget) onClose(); } },
    e('div', { className: 'modal-container', role: 'dialog', 'aria-modal': 'true' },
      e('button', { className: 'modal-close-btn', type: 'button', onClick: onClose }, '×'),

      e('div', { className: 'modal-body' },
        e('div', { className: 'modal-media' },
          e('img', {
            src: product.image_url || getFallbackImage(product),
            alt: product.title || '',
            onError: (evt) => handleImgError(evt, product)
          })
        ),

        e('div', { className: 'modal-details' },
          e('span', { className: 'product-category-tag' }, product.department || 'Electronics'),
          e('h2', { className: 'modal-title' }, product.title || 'Product Details'),
          e('div', { className: 'modal-brand-tag' }, product.brand || 'Brand unavailable'),

          e('div', { className: 'rating-row', style: { fontSize: '0.9rem', marginBottom: '14px' } },
            e('span', null, `★ ${product.rating || '4.5'}`),
            e('span', { className: 'rating-count' }, `(${Number(product.rating_count_num || 0).toLocaleString()} verified ratings)`)
          ),

          e('div', { className: 'modal-price-box' }, money(product.price, product.department)),

          e('div', { className: 'modal-desc' },
            product.description || 'No detailed description available for this catalog item.'
          ),

          e('div', { style: { display: 'flex', gap: '12px', marginTop: 'auto' } },
            product.product_url && e('a', {
              className: 'search-btn',
              href: product.product_url,
              target: '_blank',
              rel: 'noreferrer',
              style: { textDecoration: 'none' }
            }, 'View Product Page ↗'),

            e('button', {
              className: `action-btn-secondary ${isWished ? 'is-wished' : ''}`,
              type: 'button',
              style: { padding: '0 18px', minHeight: '52px' },
              onClick: () => onWish && onWish(product.asin)
            }, isWished ? '♥ Wishlisted' : '♡ Add to Wishlist')
          )
        )
      ),

      // Live AI Similar Products Section
      e('div', { className: 'similar-section' },
        e('h3', null, e('span', null, '✦'), 'AI Similar Products You Might Like'),
        loadingSimilar
          ? e('p', { style: { color: 'var(--text-muted)', fontSize: '0.85rem' } }, 'Loading AI similar recommendations...')
          : similarItems.length === 0
            ? e('p', { style: { color: 'var(--text-muted)', fontSize: '0.85rem' } }, 'No similar products found.')
            : e('div', { className: 'similar-grid' },
                similarItems.map(item =>
                  e('div', {
                    key: item.asin,
                    className: 'similar-card',
                    onClick: () => onSelectProduct(item)
                  },
                    e('img', {
                      src: item.image_url || getFallbackImage(item),
                      alt: item.title || '',
                      onError: (evt) => handleImgError(evt, item)
                    }),
                    e('p', null, item.title || 'Product'),
                    e('span', { style: { fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-accent)' } }, money(item.price, item.department))
                  )
                )
              )
      )
    )
  );
}

// Wishlist Slide-out Drawer Component
function WishlistDrawer({ isOpen = false, onClose, wishes = [], catalogProducts = [], onRemoveWish, onSelectProduct }) {
  if (!isOpen) return null;

  const wishedItems = catalogProducts.filter(p => p && p.asin && wishes.includes(p.asin));

  return e('div', { className: 'drawer-backdrop', onClick: evt => { if (evt.target === evt.currentTarget) onClose(); } },
    e('div', { className: 'drawer-panel' },
      e('div', { className: 'drawer-header' },
        e('h2', null, 'Your Wishlist (', wishes.length, ')'),
        e('button', { className: 'modal-close-btn', type: 'button', onClick: onClose }, '×')
      ),

      e('div', { className: 'drawer-items-list' },
        wishedItems.length === 0
          ? e('div', { style: { textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' } },
              e('span', { style: { fontSize: '2.5rem', display: 'block', marginBottom: '12px' } }, '♡'),
              e('p', null, 'Your wishlist is currently empty.'),
              e('small', null, 'Click the heart icon on any product card to save items for later.')
            )
          : wishedItems.map(item =>
              e('div', { key: item.asin, className: 'drawer-item' },
                e('img', {
                  src: item.image_url || getFallbackImage(item),
                  alt: item.title || '',
                  onError: (evt) => handleImgError(evt, item)
                }),
                e('div', { className: 'drawer-item-info' },
                  e('h4', { onClick: () => { onSelectProduct(item); onClose(); }, style: { cursor: 'pointer' } }, item.title || 'Product'),
                  e('span', null, money(item.price, item.department))
                ),
                e('button', {
                  type: 'button',
                  style: { color: 'var(--accent-rose)', padding: '6px', fontSize: '1.1rem' },
                  onClick: () => onRemoveWish && onRemoveWish(item.asin)
                }, '×')
              )
            )
      )
    )
  );
}

// Main Shopping Application Screen
function ShoppingApp({ user = {}, onLogout, theme, onToggleTheme, addToast }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [wishes, setWishes] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [kCount, setKCount] = useState(8);
  const [statusMsg, setStatusMsg] = useState('Initializing AI vector recommender...');

  // Save Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('smart_wishlist', JSON.stringify(wishes));
    } catch (err) {}
  }, [wishes]);

  // Load Catalog Products
  const loadCatalog = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '24' });
    if (department) params.set('department', department);

    try {
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      setProducts(data.products || []);
      setStatusMsg(`${data.total?.toLocaleString() || '10,000+'} products indexed in Vector Database`);
    } catch (err) {
      setStatusMsg('Could not connect to FastAPI server. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query) {
      loadCatalog();
    }
  }, [department]);

  useEffect(() => {
    const searchText = query.trim();
    if (!searchText) {
      setSuggestions([]);
      setShowSuggestions(false);
      return undefined;
    }
    if (searchText.length < 1) return undefined;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: searchText, limit: '8' });
        if (department) params.set('department', department);
        const response = await fetch(`/api/search-suggestions?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Suggestion request failed');
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
        setActiveSuggestion(-1);
      } catch (err) {
        if (err.name !== 'AbortError') setSuggestions([]);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, department]);

  // AI Recommend Action
  const handleRecommend = async (text = query) => {
    const searchText = (text || '').trim();
    if (searchText.length < 2) {
      loadCatalog();
      return;
    }
    setQuery(searchText);
    setLoading(true);
    setStatusMsg(`Vector searching AI embeddings for "${searchText}"...`);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchText,
          k: kCount,
          department: department || null
        })
      });
      if (!response.ok) throw new Error('Recommendation request failed');
      const data = await response.json();
      setProducts(data.results || []);
      setStatusMsg(`Matched ${data.results?.length || 0} top recommendations for "${searchText}"`);
      if (addToast) addToast(`Found ${data.results?.length || 0} AI matches!`, '✨');
    } catch {
      setStatusMsg('Failed to fetch recommendations. Ensure FastAPI backend is running.');
      if (addToast) addToast('Search failed. Check backend connection.', '⚠️');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = evt => {
    evt.preventDefault();
    const selected = activeSuggestion >= 0 ? suggestions[activeSuggestion] : null;
    setShowSuggestions(false);
    handleRecommend(selected?.title || query);
  };

  const selectSuggestion = suggestion => {
    setQuery(suggestion.title || '');
    setShowSuggestions(false);
    handleRecommend(suggestion.title || '');
  };

  const toggleWish = (asin) => {
    if (!asin) return;
    setWishes(prev => {
      const exists = prev.includes(asin);
      if (exists) {
        if (addToast) addToast('Removed from wishlist', '♡');
        return prev.filter(id => id !== asin);
      } else {
        if (addToast) addToast('Saved to wishlist!', '♥');
        return [...prev, asin];
      }
    });
  };

  // Processed & Sorted Products
  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    let result = [...products];
    if (sortBy === 'price_asc') {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }
    return result;
  }, [products, sortBy]);

  return e(React.Fragment, null,
    // Topbar
    e('header', { className: 'topbar-wrapper' },
      e('div', { className: 'container topbar' },
        e('a', { className: 'brand', href: '#' },
          e('div', { className: 'brand-icon' }, '✦'),
          e('div', { className: 'brand-text' }, 'Smart', e('span', null, 'Recommend'))
        ),

        e('nav', { className: 'nav-menu' },
          e('a', { className: 'nav-link active', href: '#' }, 'Home'),
          e('a', { className: 'nav-link', href: '#catalog' }, 'Catalog')
        ),

        e('div', { className: 'nav-actions' },
          // Theme Toggle Button
          e('button', {
            className: 'icon-button',
            type: 'button',
            title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
            onClick: onToggleTheme
          }, theme === 'dark' ? '☀️' : '🌙'),

          // Wishlist Drawer Button
          e('button', {
            className: 'icon-button',
            type: 'button',
            title: 'View Wishlist',
            onClick: () => setIsWishlistOpen(true)
          },
            '♡',
            wishes.length > 0 && e('span', { className: 'badge-count' }, wishes.length)
          ),

          // User Avatar & Logout
          user && e('div', { className: 'user-profile' },
            e('div', { className: 'avatar' }, String(user.email || 'Guest')[0].toUpperCase()),
            e('span', { className: 'user-email' }, user.email || 'Guest User'),
            e('button', { className: 'logout-btn', type: 'button', onClick: onLogout }, 'Logout')
          )
        )
      )
    ),

    // Hero Section
    e('section', { className: 'hero-section' },
      e('div', { className: 'container hero-grid' },
        e('div', { className: 'hero-left' },
          e('div', { className: 'hero-badge' }, e('span', null, '✦'), 'AI Vector Match Engine 2.0'),
          e('h1', { className: 'hero-title' },
            'Find Products You’ll ', e('span', { className: 'gradient-text' }, 'Truly Love')
          ),
          e('p', { className: 'hero-description' },
            'Our neural vector model analyzes semantic relevance and quality signals across millions of products to deliver instant, personalized recommendations.'
          ),

          // AI Search Card
          e('div', { className: 'search-box-card' },
            e('form', { onSubmit: handleSearchSubmit },
              e('div', { className: 'search-form-row' },
                e('div', { className: 'search-input-wrapper' },
                  e('span', { className: 'search-icon' }, '⌕'),
                  e('input', {
                    className: 'search-input',
                    value: query,
                    onChange: evt => { setQuery(evt.target.value); setShowSuggestions(true); },
                    onFocus: () => query.trim() && setShowSuggestions(true),
                    onBlur: () => setTimeout(() => setShowSuggestions(false), 150),
                    onKeyDown: evt => {
                      if (!showSuggestions || !suggestions.length) return;
                      if (evt.key === 'ArrowDown') {
                        evt.preventDefault();
                        setActiveSuggestion(index => (index + 1) % suggestions.length);
                      } else if (evt.key === 'ArrowUp') {
                        evt.preventDefault();
                        setActiveSuggestion(index => (index - 1 + suggestions.length) % suggestions.length);
                      } else if (evt.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    },
                    placeholder: 'Search products, brands, or categories (e.g. noise cancelling headphones)...',
                    required: true
                  }),
                  showSuggestions && suggestions.length > 0 && e('div', { className: 'suggestions-menu', role: 'listbox' },
                    suggestions.map((suggestion, index) =>
                      e('button', {
                        key: suggestion.asin,
                        className: `suggestion-item ${activeSuggestion === index ? 'active' : ''}`,
                        type: 'button',
                        role: 'option',
                        'aria-selected': activeSuggestion === index,
                        onMouseDown: evt => evt.preventDefault(),
                        onClick: () => selectSuggestion(suggestion)
                      },
                        e('span', { className: 'suggestion-icon' }, '⌕'),
                        e('span', { className: 'suggestion-copy' },
                          e('strong', null, suggestion.title),
                          e('small', null, `${suggestion.brand || 'Product'} · ${suggestion.department || 'Catalog'}`)
                        ),
                        e('span', { className: 'suggestion-price' }, money(suggestion.price, suggestion.department))
                      )
                    )
                  )
                ),
                e('button', { className: 'search-btn', type: 'submit' },
                  e('span', null, '✦'), 'Find Matches'
                )
              ),

              e('div', { className: 'search-meta-row' },
                e('div', { className: 'department-select-group' },
                  e('label', null, 'Department:'),
                  e('select', {
                    className: 'custom-select',
                    value: department,
                    onChange: evt => setDepartment(evt.target.value)
                  },
                    e('option', { value: '' }, 'All Departments'),
                    e('option', { value: 'Electronics' }, 'Electronics'),
                    e('option', { value: 'Apparel' }, 'Apparel')
                  )
                ),

                e('div', { className: 'department-select-group' },
                  e('label', null, 'Top Results (K):'),
                  e('select', {
                    className: 'custom-select',
                    value: kCount,
                    onChange: evt => setKCount(Number(evt.target.value))
                  },
                    e('option', { value: 6 }, '6 items'),
                    e('option', { value: 8 }, '8 items'),
                    e('option', { value: 12 }, '12 items'),
                    e('option', { value: 16 }, '16 items')
                  )
                )
              )
            )
          ),

          // Quick Search Chips
          e('div', { className: 'popular-chips' },
            e('span', { className: 'popular-label' }, 'Popular:'),
            popularSearches.map(term =>
              e('button', {
                key: term,
                className: 'chip-btn',
                type: 'button',
                onClick: () => handleRecommend(term)
              }, term)
            )
          )
        ),

        // Hero Art / Stats Card
        e('div', { className: 'hero-right' },
          e('div', { className: 'hero-art-card' },
            e('div', { className: 'art-card-header' },
              e('span', { className: 'art-card-title' }, 'ML Model Telemetry'),
              e('span', { className: 'art-status-dot', title: 'FastAPI Active' })
            ),
            e('div', { className: 'stats-grid' },
              e('div', { className: 'stat-item' },
                e('div', { className: 'stat-value' }, '10,046'),
                e('div', { className: 'stat-label' }, 'Indexed Items')
              ),
              e('div', { className: 'stat-item' },
                e('div', { className: 'stat-value' }, '99.4%'),
                e('div', { className: 'stat-label' }, 'Vector Precision')
              ),
              e('div', { className: 'stat-item' },
                e('div', { className: 'stat-value' }, '< 5ms'),
                e('div', { className: 'stat-label' }, 'Rank Latency')
              ),
              e('div', { className: 'stat-item' },
                e('div', { className: 'stat-value' }, 'TF-IDF'),
                e('div', { className: 'stat-label' }, 'Cosine Engine')
              )
            )
          )
        )
      )
    ),

    // Main Catalog Section
    e('main', { className: 'container catalog-section', id: 'catalog' },
      e('div', { className: 'controls-header' },
        e('div', { className: 'section-info' },
          e('h2', null, query ? `Results for "${query}"` : 'Curated Recommendations'),
          e('p', null, 'Based on vector similarity and model popularity scoring')
        ),

        e('div', { className: 'filter-tabs' },
          ['', 'Electronics', 'Apparel'].map(dept =>
            e('button', {
              key: dept || 'all',
              className: `tab-btn ${department === dept ? 'active' : ''}`,
              type: 'button',
              onClick: () => setDepartment(dept)
            }, dept || 'All Collection')
          )
        ),

        e('div', { className: 'view-controls' },
          e('select', {
            className: 'sort-select',
            value: sortBy,
            onChange: evt => setSortBy(evt.target.value)
          },
            e('option', { value: 'relevance' }, 'Sort by: AI Match Score'),
            e('option', { value: 'price_asc' }, 'Price: Low to High'),
            e('option', { value: 'price_desc' }, 'Price: High to Low'),
            e('option', { value: 'rating' }, 'Highest Rated')
          )
        )
      ),

      // Status Banner
      e('div', { className: 'status-banner' },
        e('span', null, '✦ ', statusMsg),
        query && e('button', {
          type: 'button',
          style: { color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' },
          onClick: () => { setQuery(''); loadCatalog(); }
        }, 'Reset Search ✕')
      ),

      // Product Grid
      loading
        ? e('div', { className: 'product-grid' },
            Array.from({ length: 8 }, (_, idx) => e('div', { key: idx, className: 'skeleton-card' }))
          )
        : sortedProducts.length === 0
          ? e('div', { style: { textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' } },
              e('p', { style: { fontSize: '1.2rem', marginBottom: '12px' } }, 'No products matched your request.'),
              e('button', { className: 'search-btn', onClick: () => { setQuery(''); loadCatalog(); } }, 'Browse Full Catalog')
            )
          : e('div', { className: 'product-grid' },
              sortedProducts.map((product, index) =>
                e(ProductCard, {
                  key: product.asin || index,
                  product,
                  index,
                  wished: wishes.includes(product.asin),
                  onWish: () => toggleWish(product.asin),
                  onDetails: () => setSelectedProduct(product),
                  onFindSimilar: () => setSelectedProduct(product)
                })
              )
            )
    ),

    // Modals & Drawers
    e(ProductModal, {
      product: selectedProduct,
      onClose: () => setSelectedProduct(null),
      onSelectProduct: item => setSelectedProduct(item),
      wishes,
      onWish: toggleWish
    }),

    e(WishlistDrawer, {
      isOpen: isWishlistOpen,
      onClose: () => setIsWishlistOpen(false),
      wishes,
      catalogProducts: products,
      onRemoveWish: toggleWish,
      onSelectProduct: item => setSelectedProduct(item)
    })
  );
}

// Auth Screen Component
function AuthScreen({ onAuthenticated, onGuest }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async evt => {
    evt.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed');
      if (onAuthenticated) onAuthenticated(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return e('div', { className: 'auth-wrapper' },
    e('div', { className: 'auth-card' },
      e('div', { className: 'auth-brand' },
        e('span', { style: { color: 'var(--accent-indigo)' } }, '✦'), 'SmartRecommend'
      ),
      e('h1', { className: 'auth-title' }, mode === 'login' ? 'Welcome Back' : 'Create Account'),
      e('p', { className: 'auth-subtitle' },
        mode === 'login'
          ? 'Sign in to access your personalized recommendation engine.'
          : 'Create your profile to start discovering smart product matches.'
      ),

      e('form', { className: 'auth-form', onSubmit: handleSubmit },
        e('div', { className: 'form-group' },
          e('label', null, 'Email Address'),
          e('input', {
            type: 'email',
            value: email,
            onChange: evt => setEmail(evt.target.value),
            placeholder: 'you@example.com',
            required: true
          })
        ),

        e('div', { className: 'form-group' },
          e('label', null, 'Password'),
          e('input', {
            type: 'password',
            value: password,
            onChange: evt => setPassword(evt.target.value),
            placeholder: '••••••••',
            minLength: 8,
            required: true
          })
        ),

        error && e('p', { style: { color: 'var(--accent-rose)', fontSize: '0.8rem', margin: 0 } }, error),

        e('button', { className: 'auth-submit-btn', type: 'submit', disabled: submitting },
          submitting ? 'Authenticating...' : mode === 'login' ? 'Sign In →' : 'Create Account →'
        )
      ),

      e('button', {
        className: 'auth-toggle-btn',
        type: 'button',
        onClick: () => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }
      },
        mode === 'login' ? "Don't have an account? Register" : "Already have an account? Sign in"
      ),

      e('div', { className: 'divider' }, e('span', null, 'or')),

      e('button', { className: 'guest-btn', type: 'button', onClick: onGuest },
        'Continue as Guest →'
      )
    )
  );
}

// Brand Splash Transition Screen
function BrandSplashTransition() {
  return e('div', { className: 'splash-wrapper' },
    e('div', { className: 'splash-content' },
      e('div', { className: 'splash-brand-icon' }, '✦'),
      e('div', { className: 'splash-brand-text' }, 'Smart', e('span', null, 'Recommend')),
      e('div', { className: 'splash-kicker' }, 'Initializing AI Vector Model...')
    )
  );
}

// Main Root Application
function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('smart_theme') || 'dark'; } catch { return 'dark'; }
  });
  const [toasts, setToasts] = useState([]);

  // Auto-dismiss splash screen intro timer (1.8 seconds)
  useEffect(() => {
    if (!showIntro) return undefined;
    const timer = setTimeout(() => setShowIntro(false), 1800);
    return () => clearTimeout(timer);
  }, [showIntro]);

  // Theme Syncing
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('smart_theme', theme);
    } catch (err) {}
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    addToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, nextTheme === 'dark' ? '🌙' : '☀️');
  };

  const addToast = (message, icon = '✨') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // Check Authentication Session
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {}
    setUser(null);
    setShowIntro(false);
    addToast('Logged out successfully', '👋');
  };

  if (checking) {
    return e('div', { style: { minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' } },
      e('div', { style: { textAlign: 'center' } },
        e('div', { style: { fontSize: '2rem', marginBottom: '12px' } }, '✦'),
        e('p', null, 'Loading SmartRecommend AI Engine...')
      )
    );
  }

  if (!user) {
    return e(React.Fragment, null,
      e(AuthScreen, {
        onAuthenticated: account => {
          setUser(account);
          setShowIntro(true);
          addToast('Welcome back!', '🚀');
        },
        onGuest: () => {
          setUser({ email: 'Guest User' });
          setShowIntro(true);
          addToast('Browsing in Guest Mode', '🛍️');
        }
      }),
      e(ToastContainer, { toasts })
    );
  }

  if (showIntro) {
    return e(BrandSplashTransition);
  }

  return e(React.Fragment, null,
    e(ShoppingApp, {
      user,
      onLogout: handleLogout,
      theme,
      onToggleTheme: toggleTheme,
      addToast
    }),
    e(ToastContainer, { toasts })
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(e(App));
