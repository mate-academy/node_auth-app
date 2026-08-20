import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthState } from '../store/AuthContext';
import { Loader } from '../components';

export const GuestRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthState();
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  return isAuthenticated ? (
    <Navigate to={'/profile'} state={{ from: location }} />
  ) : (
    <Outlet />
  );
};
