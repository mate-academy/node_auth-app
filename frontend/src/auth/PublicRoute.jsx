import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function PublicRoute({ children }) {
  const { isAutheticated } = useAuth();

  return isAutheticated ? <Navigate to='/profile' /> : children;
}
