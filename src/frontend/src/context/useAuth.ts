import { useContext } from 'react';
import { AuthContext } from './authContext.ts';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw Error('useAuth must be used within AuthProvider');
  }

  return context;
}
