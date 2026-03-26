import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Імпортуємо з нового файлу
import api from '../api/api';

axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  // const [accessToken, setAccessToken] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await api.post('/auth/refresh');

      setUser(response.data.user);
      // setAccessToken(response.data.accessToken);
    } catch (e) {
      console.log('AuthProvider checkAuth error', e);
      setUser(null);
      // setAccessToken(null);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // const login = (userData, token) => {
  //   setUser(userData);
  //   // setAccessToken(token);
  //   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  // };

  const login = (userData) => {
    setUser(userData);
    // Більше не встановлюємо axios.defaults.headers.common!
  };

  // const logout = async () => {
  //   try {
  //     await axios.post('http://localhost:5700/auth/logout');
  //     setUser(null);
  //     // setAccessToken(null);
  //     delete axios.defaults.headers.common['Authorization'];
  //   } catch (e) {
  //     console.error('Logout error', e);
  //   }
  // };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  );
};
