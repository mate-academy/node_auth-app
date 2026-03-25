import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Імпортуємо з нового файлу

axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:5700/auth/refresh');
      setUser(response.data.user);
      setAccessToken(response.data.accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
    } catch (e) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5700/auth/logout');
      setUser(null);
      setAccessToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isReady, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
