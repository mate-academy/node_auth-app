import React, { useMemo, useState, useCallback } from 'react';
import { accessTokenService } from '../services/accessTokenService';
import { authService } from '../services/authService';
import { User } from '../types/user';
import { userService } from '../services/userService';

/* eslint-disable @typescript-eslint/no-unused-vars */
const AuthContext = React.createContext({
  isChecked: false,
  currentUser: null as User | null,
  checkAuth: async () => {},
  activate: async (_token: string) => {},
  login: async (_email: string, _password: string) => {},
  updateName: async (_name: string) => {},
  updateEmail: async (
    _password: string,
    _email: string,
    _confirmEmail: string,
  ) => {},
  updatePassword: async (
    _currentPassword: string,
    _newPassword: string,
    _confirmPassword: string,
  ) => {},
  logout: async () => {},
});
/* eslint-enable @typescript-eslint/no-unused-vars */

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isChecked, setChecked] = useState(false);

  const activate = useCallback(async (token: string) => {
    const { accessToken, user } = await authService.activate(token);

    accessTokenService.save(accessToken);
    setCurrentUser(user);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const { accessToken, user } = await authService.refresh();

      accessTokenService.save(accessToken);
      setCurrentUser(user);
    } catch {
      accessTokenService.remove();
      setCurrentUser(null);
    } finally {
      setChecked(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await authService.login(email, password);

    accessTokenService.save(accessToken);
    setCurrentUser(user);
  }, []);

  const updateName = useCallback(async (name: string) => {
    const user = await userService.updateName(name);

    setCurrentUser(user);
  }, []);

  const updateEmail = useCallback(
    async (password: string, email: string, confirmEmail: string) => {
      const { accessToken, user } = await userService.updateEmail(
        password,
        email,
        confirmEmail,
      );

      accessTokenService.save(accessToken);
      setCurrentUser(user);
    },
    [],
  );

  const updatePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
      confirmPassword: string,
    ) => {
      const user = await userService.updatePassword(
        currentPassword,
        newPassword,
        confirmPassword,
      );

      setCurrentUser(user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      accessTokenService.remove();
      setCurrentUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      isChecked,
      currentUser,
      checkAuth,
      activate,
      login,
      updateName,
      updateEmail,
      updatePassword,
      logout,
    }),
    [
      isChecked,
      currentUser,
      checkAuth,
      activate,
      login,
      updateName,
      updateEmail,
      updatePassword,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => React.useContext(AuthContext);
