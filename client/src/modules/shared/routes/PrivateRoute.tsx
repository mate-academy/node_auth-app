import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthState } from '../store/AuthContext';
import { Loader } from '../components';

export const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthState();
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={'/login'} state={{ from: location }} />
  );
};
