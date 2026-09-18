import axios from 'axios';

const api = axios.create({
  baseURL: '', // Empty because Vite proxy handles routing '/api'
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach authorization bearer tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medcare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired tokens or global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout patient or user if token expired/unauthorized
      localStorage.removeItem('medcare_token');
      localStorage.removeItem('medcare_user');
      // We can trigger a redirect to /login or dispatch logout event if necessary
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
