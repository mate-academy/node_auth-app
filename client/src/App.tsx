import { Routes, Route, Navigate } from 'react-router-dom';
import { Earth } from './components/Earth';
import { Starfield } from './components/Starfield';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ActivatePage } from './pages/ActivatePage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { ActivateEmailPage } from './pages/ActivateEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

export const App = () => {
  return (
    <div>
      <Starfield />
      <Earth />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/activate/:activationToken" element={<ActivatePage />} />
        <Route
          path="/change-email/:resetEmailToken"
          element={<ActivateEmailPage />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset/:resetToken" element={<ResetPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};
