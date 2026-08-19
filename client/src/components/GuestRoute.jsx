import { Navigate } from 'react-router-dom';

export const GuestRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};
