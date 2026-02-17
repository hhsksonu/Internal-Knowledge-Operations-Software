import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('kp_user');
    const token = localStorage.getItem('kp_access_token');
    if (stored && token) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials);
      const { access, refresh } = res.data;
      localStorage.setItem('kp_access_token', access);
      localStorage.setItem('kp_refresh_token', refresh);
      const profile = await authAPI.getProfile();
      localStorage.setItem('kp_user', JSON.stringify(profile.data));
      setUser(profile.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Invalid credentials' };
    }
  };

  const register = async (data) => {
    try {
      const res = await authAPI.register(data);
      const { access, refresh, user: newUser } = res.data;
      localStorage.setItem('kp_access_token', access);
      localStorage.setItem('kp_refresh_token', refresh);
      localStorage.setItem('kp_user', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch (err) {
      const d = err.response?.data;
      const msg = d?.username?.[0] || d?.email?.[0] || d?.password?.[0] || d?.detail || 'Registration failed';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    ['kp_access_token', 'kp_refresh_token', 'kp_user'].forEach(k => localStorage.removeItem(k));
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('kp_user', JSON.stringify(updated));
    setUser(updated);
  };

  const isAuthenticated = () => !!user && !!localStorage.getItem('kp_access_token');
  const hasRole = (roles) => user && (Array.isArray(roles) ? roles.includes(user.role) : user.role === roles);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
