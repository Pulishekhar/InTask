import axios from 'axios';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;


console.log("🔍 API_BASE_URL:", API_BASE_URL);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem('intask_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('intask_token') || '');
  const [loading, setLoading] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const verificationRef = useRef(false);
  const navigate = useNavigate();

  // ✅ Axios instance
  const authApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });

  // ✅ Attach token automatically to every request
  authApi.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('intask_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 🔴 Handle errors
  const handleAuthError = (error, defaultMessage = 'Authentication error') => {
    const errorMessage = error.response?.data?.error ||
                         error.response?.data?.message ||
                         error.message ||
                         defaultMessage;

    console.error('Auth Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.status === 401 || error.response?.status === 403) {
      logout(false);
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(errorMessage);
    }

    return false;
  };

  // ✅ Login
  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authApi.post('/auth/login', credentials);

      if (!res.data.success) {
        throw new Error(res.data.error || 'Login failed');
      }

      updateAuthState(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);

      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }

      return true;
    } catch (err) {
      return handleAuthError(err, 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Register
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.post('/auth/register', userData);

      if (!res.data.success) {
        throw new Error(res.data.error || 'Registration failed');
      }

      updateAuthState(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}!`);
      navigate('/dashboard');
      return true;
    } catch (err) {
      return handleAuthError(err, 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Set user & token
  const updateAuthState = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('intask_token', newToken);
    localStorage.setItem('intask_user', JSON.stringify(newUser));
  };

  // ✅ Logout
  const logout = (shouldRedirect = true) => {
    setToken('');
    setUser(null);
    localStorage.removeItem('intask_token');
    localStorage.removeItem('intask_user');
    if (shouldRedirect) navigate('/login');
  };

  // ✅ Verify token
  const verifyToken = async () => {
    if (!token) {
      setIsAppReady(true);
      return false;
    }
    if (verificationRef.current) return true;
    verificationRef.current = true;

    try {
      const res = await authApi.get('/auth/verify'); // token automatically attached

      if (res.data?.user) {
        setUser(res.data.user);
        return true;
      }
    } catch (err) {
      handleAuthError(err, 'Session verification failed');
    } finally {
      verificationRef.current = false;
      setIsAppReady(true);
    }
  };

  // ✅ Run on mount
  useEffect(() => {
    verifyToken();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAppReady,
        api: authApi,
        register,
        login,
        logout,
        verifyToken,
        isAdmin: user?.role === 'admin',
        isTeamLead: user?.role === 'lead',
        isTeamMember: user?.role === 'member',
        currentTeamId: user?.teamId,
        currentTeamName: user?.teamName
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
