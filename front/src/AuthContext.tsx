import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import { apiFetch, SessionExpiredError  } from "@/api";

type User = {
  name: string;
  email: string;
  isActive: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  async function request() {
    try {
      const response = await apiFetch("/auth/profile");

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setUser(data.user);
    } catch (error) {
      if (!(error instanceof SessionExpiredError)) {
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  request();
}, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
