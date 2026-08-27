const PRODUCT_API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PRODUCT_API_BASE_URL) ||
  '/product-api';

function normalizeDepartment(dept) {
  if (!dept || dept === 'All' || dept === 'all' || dept === 'ALL') return null;
  const lower = String(dept).toLowerCase().trim();
  if (lower.includes('electronic') || lower.includes('tech') || lower.includes('gadget')) {
    return 'Electronics';
  }
  if (lower.includes('apparel') || lower.includes('fashion') || lower.includes('cloth') || lower.includes('style')) {
    return 'Apparel';
  }
  if (dept === 'Electronics' || dept === 'Apparel') {
    return dept;
  }
  return null;
}

async function productFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${PRODUCT_API_BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || `Product API error: ${response.status}`);
  }

  return data;
}

export const productApi = {
  getHealth: async () => {
    try {
      const data = await productFetch('/health');
      const isOk = Boolean(data && (data.status === 'ok' || data.products > 0));
      return {
        isHealthy: isOk,
        ...data
      };
    } catch (err) {
      return { isHealthy: false, error: err.message };
    }
  },

  getProducts: async (department = null, limit = 24) => {
    const params = new URLSearchParams();
    const deptVal = normalizeDepartment(department);
    if (deptVal) params.append('department', deptVal);
    if (limit) params.append('limit', limit);
    const queryString = params.toString();
    return productFetch(`/api/products${queryString ? `?${queryString}` : ''}`);
  },

  searchSuggestions: async (query, department = null, limit = 8) => {
    const params = new URLSearchParams();
    params.append('q', query);
    const deptVal = normalizeDepartment(department);
    if (deptVal) params.append('department', deptVal);
    if (limit) params.append('limit', limit);
    return productFetch(`/api/search-suggestions?${params.toString()}`);
  },

  recommendProducts: async (query, department = null, k = 16) => {
    const deptVal = normalizeDepartment(department);
    const safeK = Math.min(Math.max(1, Number(k) || 16), 20); // FastAPI limit is le=20
    return productFetch('/api/recommend', {
      method: 'POST',
      body: JSON.stringify({
        query,
        department: deptVal,
        k: safeK
      })
    });
  },

  getSimilarProducts: async (asin, k = 6) => {
    return productFetch(`/api/products/${encodeURIComponent(asin)}/similar?k=${k}`);
  },

  registerUser: async (email, password) => {
    return productFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  loginUser: async (email, password) => {
    return productFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getMe: async () => {
    return productFetch('/api/auth/me');
  },

  logoutUser: async () => {
    return productFetch('/api/auth/logout', { method: 'POST' });
  }
};

export default productApi;
