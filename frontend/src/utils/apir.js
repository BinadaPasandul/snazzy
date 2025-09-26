import axios from 'axios';

const apir = axios.create({
  baseURL: 'http://localhost:5000/refund', // your backend URL
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // JWT stored after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Bearer <token>
  }
  return config;
});

export default apir;
