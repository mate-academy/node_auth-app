import React, { useMemo, useState } from "react";
import { authService } from "../services/authService";
import { accessTokenService } from "../services/accessTokenService";
import type { User } from "../../types/User";

interface AuthContextType {
  user: User | null;
  isChecked: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  activate: (token: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Создаем контекст с начальным значением
export const AuthContext = React.createContext<AuthContextType>({} as AuthContextType);

type Props = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isChecked, setChecked] = useState<boolean>(false); // Изначально false, пока проверяем

  async function activate(activationToken: string) {
    const { accessToken, user } = await authService.activate(activationToken);
    accessTokenService.save(accessToken);
    setUser(user);
  }

  async function checkAuth() {
    try {
      const { accessToken, user } = await authService.refresh();
      accessTokenService.save(accessToken);
      setUser(user);
    } catch (error: any) {
      console.log('User is not authenticated');
    } finally {
      setChecked(true);
    }
  }

  async function login(email: string, password: string) {
    const { accessToken, user } = await authService.login(email, password);

    accessTokenService.save(accessToken);
    setUser(user);
  }

  async function logout() {
    await authService.logout();

    accessTokenService.remove();
    setUser(null);
  }

  const value = useMemo(() => ({
    isChecked,
    user,
    setUser,
    checkAuth,
    activate,
    login,
    logout
  }), [user, isChecked]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
