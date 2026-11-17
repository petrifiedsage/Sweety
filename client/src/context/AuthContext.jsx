import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sweety_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sweety_token'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('sweety_token')));

  useEffect(() => {
    let active = true;
    async function verifySession() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchCurrentUser();
        if (active && data?.user) {
          setUser(data.user);
          localStorage.setItem('sweety_user', JSON.stringify(data.user));
        }
      } catch {
        if (active) {
          localStorage.removeItem('sweety_token');
          localStorage.removeItem('sweety_user');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    verifySession();
    return () => {
      active = false;
    };
  }, [token]);

  async function login(credentials) {
    const data = await loginUser(credentials);
    localStorage.setItem('sweety_token', data.token);
    localStorage.setItem('sweety_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register(details) {
    const data = await registerUser(details);
    localStorage.setItem('sweety_token', data.token);
    localStorage.setItem('sweety_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem('sweety_token');
    localStorage.removeItem('sweety_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
