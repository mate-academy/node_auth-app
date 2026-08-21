import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem('token')),
  );

  const API_URL = 'http://localhost:3005/api';

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => setUser(data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setLoading(true);
    setToken(newToken);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, setUser, login, logout, loading, API_URL }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
