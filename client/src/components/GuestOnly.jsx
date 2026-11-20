import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GuestOnly() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}
