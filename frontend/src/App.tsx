import { Routes, Route } from 'react-router-dom';

// Сторінки
import HomePage from './pages/HomePage/HomePage';
import ActivationPage from './pages/ActivationPage/ActivationPage';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPasswordPage/ResetPassword';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';

// Компоненти
import AuthGuard from './components/common/AuthGuard';
import './App.css';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/activation/:email/:token" element={<ActivationPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password/:token" element={<ResetPassword />} />

      <Route
        path="/profile"
        element={
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
