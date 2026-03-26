/**
 * useAuth — Hook customizado para acessar o contexto de autenticação.
 *
 * Retorna: { user, loading, login, register, logout, activate, refreshUser }
 *
 * Deve ser utilizado apenas dentro de um <AuthProvider>.
 * Lança erro caso seja usado fora do provider.
 */
import { useContext } from 'react';
import { AuthContext } from './authContextValue';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
