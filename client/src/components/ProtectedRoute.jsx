import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, isReady } = useContext(AuthContext);

  // Поки ми перевіряємо токен через /refresh, показуємо порожній екран або лоадер
  if (!isReady) {
    return <div>Завантаження...</div>;
  }

  // Якщо користувача немає в контексті — відправляємо на логін
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  console.log('Current user in Guard:', user);

  // Якщо юзер є — рендеримо дочірні маршрути
  return <Outlet />;
};
