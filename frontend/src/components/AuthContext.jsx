import React, { useCallback, useMemo, useState } from 'react';
import { accessTokenService } from '../services/accessTokenService.js';
import { authService } from '../services/authService.js';

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isChecked, setChecked] = useState(false);

  const activate = useCallback(async activationToken => {
    const { accessToken, user: u } =
      await authService.activate(activationToken);

    accessTokenService.save(accessToken);
    setUser(u);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const { accessToken, user: u } = await authService.refresh();

      accessTokenService.save(accessToken);
      setUser(u);
    } catch {
      // not authenticated
    } finally {
      setChecked(true);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { accessToken, user: u } = await authService.login({
      email,
      password,
    });

    accessTokenService.save(accessToken);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();

    accessTokenService.remove();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isChecked,
      user,
      checkAuth,
      activate,
      login,
      logout,
    }),
    [user, isChecked, checkAuth, activate, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
