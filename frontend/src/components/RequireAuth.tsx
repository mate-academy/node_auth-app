import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from 'lucide-react';

export const RequireAuth = () => {
  const { isChecked, user } = useContext(AuthContext);
  const location = useLocation();

  if (!isChecked) {
    return <Loader2 />;
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return <Outlet />
}