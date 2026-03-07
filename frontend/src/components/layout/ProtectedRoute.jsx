import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../ui/Loader';

export const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader centered />;

  return user ? children : <Navigate to="/login" replace />;
};

export const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader centered />;

  return user ? <Navigate to="/profile" replace /> : children;
};
