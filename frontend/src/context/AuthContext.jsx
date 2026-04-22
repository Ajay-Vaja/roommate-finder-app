import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (e.g. from localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, verify token via API. For mock:
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // try {
    //   const { data } = await api.post('/auth/login', { email, password });
    //   localStorage.setItem('token', data.access_token);
    //   setUser({ token: data.access_token });
    // } catch(e) { throw e; }
    
    // Mock login for scaffold
    localStorage.setItem('token', 'mock_token');
    setUser({ token: 'mock_token' });
  };

  const register = async (userData) => {
    // await api.post('/auth/register', userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
