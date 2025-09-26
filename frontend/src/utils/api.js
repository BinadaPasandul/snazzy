import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // your backend URL
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // JWT stored after login
  if (token) {
    // ✅ Send only the raw token (no "Bearer ")
    config.headers.Authorization = token;
  }
  return config;
});

export default api;
