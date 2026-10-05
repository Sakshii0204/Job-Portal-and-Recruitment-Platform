import axios from 'axios';

// Central API configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized and network errors centrally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid or expired, clear storage
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // Format human-friendly error messages if server is unreachable
    if (!error.response) {
      error.friendlyMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else {
      error.friendlyMessage = error.response.data?.message || 'An unexpected error occurred.';
    }

    return Promise.reject(error);
  }
);

export default API;
