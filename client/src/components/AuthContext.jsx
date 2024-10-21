import React, { useMemo, useState } from 'react';
import { accessTokenService } from '../services/accessTokenService.js';
import { authService } from '../services/authService.js';

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isChecked, setChecked] = useState(true);

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
    await authService.logout();

    accessTokenService.remove();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      isChecked,
      user,
      checkAuth,
      activate,
      login,
      logout,
    }),
    [user, isChecked],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
