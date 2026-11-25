import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const isTokenExpired = (tokenStr) => {
  if (!tokenStr) return true;
  try {
    const parts = tokenStr.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (saved && savedToken && !isTokenExpired(savedToken)) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && !isTokenExpired(savedToken)) {
      return savedToken;
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      if (isTokenExpired(savedToken)) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } else {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch (err) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
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
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(res.data.token);
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
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      setToken(res.data.token);
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

  const activeUser = user || (() => {
    try {
      const savedToken = localStorage.getItem('token');
      if (savedToken && !isTokenExpired(savedToken)) {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
      }
    } catch {}
    return null;
  })();

  const activeToken = token || (() => {
    const savedToken = localStorage.getItem('token');
    return (savedToken && !isTokenExpired(savedToken)) ? savedToken : null;
  })();

  const isAdmin = activeUser?.role === 'ROLE_ADMIN';
  const isAgent = activeUser?.role === 'ROLE_AGENT';
  const isEmployee = activeUser?.role === 'ROLE_EMPLOYEE';
  const isAuthenticated = !!activeToken && !!activeUser;

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        token: activeToken,
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

export default AuthContext;
