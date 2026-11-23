import type React from 'react'
import { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from '../types/User';

type Props = {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{user, setUser}}>
      {children}
    </AuthContext.Provider>
  );
};