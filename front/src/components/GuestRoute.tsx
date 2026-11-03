import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/AuthContext";

export default function GuestRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}
