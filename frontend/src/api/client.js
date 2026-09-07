import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear localStorage if not already on login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // Only remove if it was an invalid/expired token error
        const msg = error.response.data?.error || '';
        if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('expired')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
