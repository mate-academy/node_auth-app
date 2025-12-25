import React, { useMemo, useState } from "react";
import { accessTokenService } from "../services/accessTokenService";
import { authService } from "../services/authService";
import type { User } from "../types/user";

/* eslint-disable @typescript-eslint/no-unused-vars */
const AuthContext = React.createContext({
  isChecked: false,
  currentUser: null as User | null,
  checkAuth: async () => {},
  activate: async (_email: string, _token: string) => {},
  login: async (_email: string, _password: string) => {},
  logout: async () => {},
});
/* eslint-enable @typescript-eslint/no-unused-vars */

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isChecked, setChecked] = useState(false);

  async function activate(email: string, token: string) {
    const { accessToken, user } = await authService.activate(email, token);

    accessTokenService.save(accessToken);
    setCurrentUser(user);
    setChecked(true);
  }

  async function checkAuth() {
    if (currentUser) {
      setChecked(true);
      return;
    }

    try {
      const { accessToken, user } = await authService.refresh();

      accessTokenService.save(accessToken);
      setCurrentUser(user);
    } catch (error) {
      console.log("User is not authenticated");
    } finally {
      setChecked(true);
    }
  }

  async function login(email: string, password: string) {
    const { accessToken, user } = await authService.login(email, password);

    accessTokenService.save(accessToken);
    setCurrentUser(user);
    setChecked(true);
  }

  async function logout() {
    setCurrentUser(null);
    accessTokenService.remove();
    await authService.logout();
  }

  const value = useMemo(
    () => ({
      isChecked,
      currentUser,
      checkAuth,
      activate,
      login,
      logout,
    }),
    [currentUser, isChecked]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => React.useContext(AuthContext);
