// src/components/common/AuthGuard.tsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';

interface AuthGuardProps {
  children: React.ReactNode;
  isPublicOnly?: boolean;
}

const AuthGuard = ({ children, isPublicOnly = false }: AuthGuardProps) => {
  const { isAuth } = useSelector((state: RootState) => state.auth);

  if (isPublicOnly && isAuth) {
    return <Navigate to="/profile" replace />;
  }

  if (!isPublicOnly && !isAuth) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
