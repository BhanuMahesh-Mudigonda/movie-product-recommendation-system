const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {

    throw new Error(
      data?.detail ||
      data?.message ||
      'Something went wrong'
    );

  }

  return data;
}

export const authApi = {

  signup: async (name, email, password) => {

    return request('/auth/signup', {
      method: 'POST',

      body: JSON.stringify({
        name,
        email,
        password
      })

    });

  },

  login: async (email, password) => {

    return request('/auth/login', {
      method: 'POST',

      body: JSON.stringify({
        email,
        password
      })

    });

  },

  getMe: async () => {

    const token =
      localStorage.getItem('moviemind_token');

    return request('/auth/me', {
      method: 'GET',

      headers: {
        Authorization: `Bearer ${token}`
      }

    });

  }

};
