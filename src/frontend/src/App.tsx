import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ActivationPage } from './pages/ActivationPage';
import { AccountPage } from './pages/AccountPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ResetPasswordRequestPage } from './pages/ResetPasswordRequestPage';
import { ResetPasswordEmailSentPage } from './pages/ResetPasswordEmailSentPage';
import { ResetPasswordConfirmPage } from './pages/ResetPasswordConfirmPage';
import { ResetPasswordSuccessPage } from './pages/ResetPasswordSuccessPage';
import './styles.css';

const pageTitles: Record<string, string> = {
  '/': 'Log In',
  '/login': 'Log In',
  '/register': 'Sign Up',
  '/reset-password': 'Reset Password',
  '/reset-password/sent': 'Check Your Email',
  '/reset-password/confirm': 'Choose New Password',
  '/reset-password/success': 'Password Reset Complete',
  '/activation': 'Email Verified',
  '/account': 'My Account',
};

function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = pageTitles[pathname] ?? 'Page Not Found';
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <PageTitle />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordRequestPage />} />
        <Route
          path="/reset-password/sent"
          element={<ResetPasswordEmailSentPage />}
        />
        <Route
          path="/reset-password/confirm"
          element={<ResetPasswordConfirmPage />}
        />
        <Route
          path="/reset-password/success"
          element={<ResetPasswordSuccessPage />}
        />
        <Route path="/activation" element={<ActivationPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
