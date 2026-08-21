import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
