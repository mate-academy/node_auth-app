import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  activateUser,
  loginUser,
  logoutUser,
  updateProfile,
} from '../api/auth';
import { refreshSession, setAccessToken, setOnAuthFail } from '../api/http';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setOnAuthFail(clearSession);

    refreshSession()
      .then((data) => setUser(data.user))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const { user, accessToken } = await loginUser(credentials);

    setAccessToken(accessToken);
    setUser(user);
  }, []);

  const activate = useCallback(async (activationToken) => {
    const { user, accessToken } = await activateUser(activationToken);

    setAccessToken(accessToken);
    setUser(user);
  }, []);

  const updateName = useCallback(async (name) => {
    const updatedUser = await updateProfile({ name });

    setUser(updatedUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      activate,
      logout,
      updateName,
    }),
    [user, isLoading, login, activate, logout, updateName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
