import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader } from './Loader';
import { RequireActivation } from './RequireActivation';

export const RequireAuth = ({ children }: { children?: React.ReactNode }) => {
  const { isChecked, currentUser, isActivated } = useAuth();
  const location = useLocation();

  if (!isChecked) {
    return <Loader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isActivated) {
    return <RequireActivation />;
  }

  return children ?? <Outlet />;
};
