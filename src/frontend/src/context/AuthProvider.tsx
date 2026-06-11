import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./authContext";
import { authApi } from "../api/auth";
import { client } from "../api/client";
import type { User } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .refresh()
      .then(({ data }) => {
        setUser(data.user);
        client.defaults.headers["Authorization"] = `Bearer ${data.token}`;
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    setUser(data.user);
    client.defaults.headers["Authorization"] = `Bearer ${data.token}`;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    delete client.defaults.headers["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
