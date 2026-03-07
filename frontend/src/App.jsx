import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ActivatePage } from './pages/ActivatePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CheckEmailPage } from './pages/CheckEmailPage';

export const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />

    {/* для неавторизованих */}
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/activate/:token" element={<PublicRoute><ActivatePage /></PublicRoute>} />
    <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
    <Route path="/check-email" element={<CheckEmailPage />} />
    <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

    {/* для авторизованих */}
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
