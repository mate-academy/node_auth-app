import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authClient } from '../services/authClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setBootstrapping(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await authClient.me(token);
        setUser(data.user);
      } catch (error) {
        console.warn('Не вдалось отримати користувача:', error.message);
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
        setBootstrapping(false);
      }
    };

    run();
  }, [token]);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const data = await authClient.login(credentials);
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
      }

      setUser(data.user ?? null);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload) => {
    setIsLoading(true);
    try {
      const data = await authClient.register(payload);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const activate = async (tokenFromLink) => {
    setIsLoading(true);
    try {
      const data = await authClient.activate(tokenFromLink);
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
      }

      setUser(data.user ?? null);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authClient.logout(token);
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const updateProfile = async (payload) => {
    const data = await authClient.updateProfile(payload, token);
    setUser(data.user);
    return data;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      bootstrapping,
      login,
      register,
      activate,
      logout,
      updateProfile,
      setUser,
    }),
    [user, token, isLoading, bootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth слід використовувати всередині AuthProvider');
  }

  return ctx;
}
