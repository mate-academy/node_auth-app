import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { accessTokenService } from '../services/accessTokenService';
import { authService } from '../services/authService';
import { User } from '../types/user';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  isChecked: boolean;
  currentUser: User | null;
  checkAuth: () => Promise<void>;
  activate: (email: string, token: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isChecked: false,
  currentUser: null,
  checkAuth: async () => {},
  activate: async () => {},
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(
    JSON.parse(localStorage.getItem('user') || 'null'),
  );
  const [isChecked, setChecked] = useState(false);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    accessTokenService.remove();
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/login');
  }, [navigate]);

  const checkAuth = useCallback(async () => {
    try {
      const { accessToken, user } = await authService.refresh();
      accessTokenService.save(accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setChecked(true);
    }
  }, [logout]);

  const activate = useCallback(
    async (email: string, token: string) => {
      try {
        const { accessToken, user } = await authService.activate(email, token);
        accessTokenService.save(accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        navigate('/');
      } catch (error) {
        console.error('Activation failed:', error);
      }
    },
    [navigate],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { accessToken, user } = await authService.login(email, password);
        accessTokenService.save(accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        navigate('/');
      } catch (error) {
        console.error('Login error:', error);
      }
    },
    [navigate],
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = useMemo(
    () => ({
      isChecked,
      currentUser,
      checkAuth,
      activate,
      login,
      logout,
    }),
    [isChecked, currentUser, checkAuth, activate, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
