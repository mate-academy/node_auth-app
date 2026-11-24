import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckEmailPage from './pages/CheckEmailPage';
import ActivationPage from './pages/ActivationPage';
import ProfilePage from './pages/ProfilePage';
import RequireAuth from './components/RequireAuth';
import GuestOnly from './components/GuestOnly';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetEmailSentPage from './pages/ResetEmailSentPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ResetSuccessPage from './pages/ResetSuccessPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/check-email" element={<CheckEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-email-sent" element={<ResetEmailSentPage />} />
            <Route
              path="/reset-password/:resetToken"
              element={<ResetPasswordPage />}
            />
            <Route path="/reset-success" element={<ResetSuccessPage />} />
            <Route
              path="/activation/:activationToken"
              element={<ActivationPage />}
            />
            <Route
              path="/confirm-email/:token"
              element={<ConfirmEmailPage />}
            />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}
