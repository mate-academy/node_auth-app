import { createContext } from 'react';

interface User {
  id: number | null;
  email: string;
  name: string | null;
  isActivated: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
export type { User, AuthContextType };
