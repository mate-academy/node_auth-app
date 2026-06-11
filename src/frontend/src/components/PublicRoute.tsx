import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (user) return <Navigate to="/profile" />;

  return <>{children}</>;
}