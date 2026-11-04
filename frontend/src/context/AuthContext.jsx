import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await authService.login(username, password);
    if (res.success && res.data) {
      const userData = {
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
        fullName: res.data.fullName,
        role: res.data.role,
        department: res.data.department,
      };
      setUser(userData);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      const newUser = {
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
        fullName: res.data.fullName,
        role: res.data.role,
        department: res.data.department,
      };
      setUser(newUser);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isAgent = user?.role === 'ROLE_AGENT';
  const isEmployee = user?.role === 'ROLE_EMPLOYEE';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
        isAgent,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
