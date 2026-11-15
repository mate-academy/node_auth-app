import React, { useMemo, useState } from 'react';
import { accessTokenService } from '../services/accessTokenService.js';
import { authService } from '../services/authService.js';
import { httpClient } from '../http/httpClient.js';

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isChecked, setChecked] = useState(false);

  async function activate(activationToken) {
    const { accessToken, user } = await authService.activate(activationToken);

    accessTokenService.save(accessToken);
    setUser(user);
  }

  async function checkAuth() {
    try {
      const { accessToken, user } = await authService.refresh();

      accessTokenService.save(accessToken);
      setUser(user);
    } catch (error) {
      console.log('User is not authentincated');
    } finally {
      setChecked(true);
    }
  }

  async function login({ email, password }) {
    const { accessToken, user } = await authService.login({ email, password });

    accessTokenService.save(accessToken);
    setUser(user);
  }

  async function logout() {
    try {
      // /logout is protected on the server, so it goes through httpClient:
      // it sends the access token and refreshes it if it has expired
      await httpClient.post('/logout');
    } finally {
      // Forget the session locally even if the request failed
      accessTokenService.remove();
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      isChecked,
      user,
      setUser,
      checkAuth,
      activate,
      login,
      logout,
    }),
    [user, isChecked],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
