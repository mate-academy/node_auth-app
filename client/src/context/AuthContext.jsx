/**
 * AuthProvider — Provedor global de autenticação.
 *
 * Responsabilidades:
 * - Manter o estado do usuário logado (user)
 * - Tentar restaurar sessão via refresh token ao carregar
 * - Expor funções: login, register, logout, activate, refreshUser
 *
 * Uso: envolve toda a árvore de componentes em App.jsx.
 * Consumo: via hook useAuth() nos componentes filhos.
 */
import { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { AuthContext } from './authContextValue';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tenta recuperar o usuário via refresh token ao carregar
  useEffect(() => {
    authApi.refresh()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    return data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const activate = async (token) => {
    const data = await authApi.activate(token);
    setUser(data.user);
    return data;
  };

  const refreshUser = async () => {
    try {
      const data = await authApi.getProfile();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      activate,
      refreshUser,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
