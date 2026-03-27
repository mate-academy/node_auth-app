import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const GuestRoute = () => {
  const { user, isReady } = useContext(AuthContext);

  // Чекаємо, поки AuthProvider завершить перевірку checkAuth
  if (!isReady) {
    return <div>Завантаження...</div>;
  }

  // Якщо користувач ВЖЕ авторизований — відправляємо його на профіль
  if (user) {
    return <Navigate to="/profile" replace />;
  }

  // Якщо користувача немає (гість) — рендеримо вкладені маршрути через Outlet
  return <Outlet />;
};
