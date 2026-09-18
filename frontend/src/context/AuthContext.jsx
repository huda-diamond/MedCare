import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session from localStorage on startup
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('medcare_token');
      const savedUser = localStorage.getItem('medcare_user');
      
      if (token && savedUser) {
        try {
          // Double check server status and fetch fresh profile
          const { data } = await api.get('/api/auth/profile');
          setUser(data);
          localStorage.setItem('medcare_user', JSON.stringify(data));
        } catch (err) {
          console.error('Session validation failed. Logging out.', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      
      localStorage.setItem('medcare_token', data.token);
      
      // Fetch the full profile to get detailed roles details right away
      const profileRes = await api.get('/api/auth/profile');
      setUser(profileRes.data);
      localStorage.setItem('medcare_user', JSON.stringify(profileRes.data));
      
      setLoading(false);
      return profileRes.data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/auth/register', userData);
      
      localStorage.setItem('medcare_token', data.token);
      
      // Fetch full profile
      const profileRes = await api.get('/api/auth/profile');
      setUser(profileRes.data);
      localStorage.setItem('medcare_user', JSON.stringify(profileRes.data));
      
      setLoading(false);
      return profileRes.data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('medcare_token');
    localStorage.removeItem('medcare_user');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put('/api/auth/profile', profileData);
      setUser(data);
      localStorage.setItem('medcare_user', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Failed to update profile.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
