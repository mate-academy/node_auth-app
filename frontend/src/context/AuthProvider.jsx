import { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .refresh()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('accessToken', data.accessToken);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
