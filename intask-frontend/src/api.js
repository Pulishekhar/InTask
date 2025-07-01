// src/api.js
import axios from 'axios';

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Hardcoded for now to eliminate env variable issues
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Important for sessions/cookies
});

// Request interceptor to add auth token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('intask_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network Error - Is the backend running?');
      throw new Error('Unable to connect to server. Please check your connection.');
    }

    // Handle specific HTTP status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.warn('Unauthorized - Redirecting to login');
          // You might want to redirect to login here
          break;
        case 403:
          console.warn('Forbidden - Insufficient permissions');
          break;
        case 404:
          console.warn('Endpoint not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('Unhandled HTTP error', error.response.status);
      }
    }

    return Promise.reject(error);
  }
);

export default api;