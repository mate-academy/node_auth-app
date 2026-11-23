import type React from 'react'
import { useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from '../types/User';
import { authApi } from '../api/authApi';

type Props = {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const isRequested  = useRef(false);

  useEffect(() => {

    if (isRequested.current) {
      return;
    }

    isRequested.current = true;

    const refresh = async() => {
      try {
        const {data} = await authApi.checkAuth();
        setUser(data.user);
      } catch {
        setUser(null);
      }finally {
        setIsChecking(false);
      }
    }
    refresh();
  }, [])

  return (
    <AuthContext.Provider value={{user, setUser, isChecking }}>
      {children}
    </AuthContext.Provider>
  );
};