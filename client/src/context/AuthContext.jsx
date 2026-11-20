import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loginUser } from '../api/auth';
import { TOKEN_KEY } from '../api/http';

const USER_KEY = 'user';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async (credentials) => {
    try {
      const { user, accessToken } = await loginUser(credentials);

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUser(user);
    } catch (err) {
      if (err.status === 401) {
        throw new Error('Wrong email or password');
      }
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthProvider error');
  }

  return context;
}
