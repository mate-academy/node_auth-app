import React, { useMemo, useState, useCallback } from 'react';
import { accessTokenService } from '../services/accessTokenService.js';
import { authService } from '../services/authService.js';

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isChecked, setChecked] = useState(true);

  const activate = useCallback(async (activationToken) => {
    const { accessToken, user } = await authService.activate(activationToken);

    accessTokenService.save(accessToken);
    setUser(user);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const { accessToken, user } = await authService.refresh();

      accessTokenService.save(accessToken);
      setUser(user);
    } catch (error) {
      console.log('User is not authenticated');
    } finally {
      setChecked(true);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { accessToken, user } = await authService.login({ email, password });

    accessTokenService.save(accessToken);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();

    accessTokenService.remove();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    isChecked,
    user,
    checkAuth,
    activate,
    login,
    logout,
  }), [isChecked, user, checkAuth, activate, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
