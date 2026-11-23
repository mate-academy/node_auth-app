import { createContext, useContext } from "react";
import type { User } from "../types/User";

type AuthContextType  = {
  user: User | null;
  setUser: (user: User | null) => void;
  isChecking: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};

