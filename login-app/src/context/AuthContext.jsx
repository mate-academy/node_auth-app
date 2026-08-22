import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Relative path — goes through the Vite dev-server proxy configured in
// vite.config.js, so the browser sees it as same-origin (no CORS / cross-site
// cookie issues) both in dev and once built behind a reverse proxy.
const API_URL = '/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem('token')),
  );

  const clearSession = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      clearSession();
      setLoading(false);
    }
  };

  // Wrapper around fetch that attaches the access token and transparently
  // retries once via the refresh-token cookie if the access token expired.
  const authFetch = async (path, options = {}) => {
    const doFetch = (accessToken) =>
      fetch(`${API_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        },
      });

    let res = await doFetch(token);

    if (res.status === 401) {
      const refreshRes = await fetch(`${API_URL}/refresh`, {
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();

        localStorage.setItem('token', data.accessToken);
        setToken(data.accessToken);
        res = await doFetch(data.accessToken);
      }
    }

    return res;
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    fetch(`${API_URL}/profile`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setLoading(true);
    setToken(newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        login,
        logout,
        loading,
        API_URL,
        authFetch,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
