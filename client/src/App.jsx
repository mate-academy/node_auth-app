import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { GuestRoute } from './components/GuestRoute.jsx';

import { RegisterPage } from './pages/RegisterPage.jsx';
import { ActivationPage } from './pages/ActivationPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';
import { EmailSentPage } from './pages/EmailSentPage.jsx';
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx';
import { ResetSuccessPage } from './pages/ResetSuccessPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { ConfirmEmailPage } from './pages/ConfirmEmailPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      <Route
        path="/activation/:token"
        element={
          <GuestRoute>
            <ActivationPage />
          </GuestRoute>
        }
      />

      <Route
        path="/confirm-email/:token"
        element={<ConfirmEmailPage />}
      />

      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />

      <Route
        path="/email-sent"
        element={
          <GuestRoute>
            <EmailSentPage />
          </GuestRoute>
        }
      />

      <Route
        path="/reset-password/:token"
        element={
          <GuestRoute>
            <ResetPasswordPage />
          </GuestRoute>
        }
      />

      <Route
        path="/reset-success"
        element={
          <GuestRoute>
            <ResetSuccessPage />
          </GuestRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
};
