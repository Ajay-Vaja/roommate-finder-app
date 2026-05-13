import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';


export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        console.error("Token invalid or expired");
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    }
    setLoading(false);
  };


  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    // Send email/password to backend
    const { data } = await api.post('/auth/login', { email, password });

    // Save tokens to localStorage
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);

    // Save user data to React state
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data.user;
  };


  const register = async (userData) => {
    // Step 1: Initialize registration (sends OTP)
    const { data } = await api.post('/auth/register', userData);
    return data;
  };

  const verifyOtp = async (email, otp) => {
    // Step 2: Verify OTP and create account
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, logout, checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
