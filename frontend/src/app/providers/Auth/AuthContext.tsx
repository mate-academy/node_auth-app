import { authService } from '@/http/authClient';
import { accessTokenService } from '@/services/accessTokenService';
import { AuthUser } from '@/shared/type';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type AuthContextType = {
  isChecked: boolean;
  user: AuthUser | null;
  checkAuth: () => Promise<void>;
  activate: (activationToken: string) => Promise<void>;
  login: ({ email, password }: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecked, setChecked] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function activate(activationToken: string) {
    const { accessToken, user } = await authService.activate(activationToken);

    accessTokenService.save(accessToken);
    setUser(user);
  }

  async function login({ email, password }: { email: string; password: string }) {
    const { accessToken, user } = await authService.login({ email, password });

    accessTokenService.save(accessToken);
    setUser(user);
  }

  async function logout() {
    await authService.logout();

    accessTokenService.remove();
    setUser(null);
  }

  async function checkAuth() {
    try {
      const { user } = await authService.getMe();
      setUser(user);
    } finally {
      setChecked(true);
    }
  }

  const value = useMemo(
    () => ({
      user,
      isChecked,
      activate,
      login,
      checkAuth,
      logout,
    }),
    [isChecked, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}
