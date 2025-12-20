import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Spinner from './components/Spinner.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Register from './pages/Register.jsx';
import Activation from './pages/Activation.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PasswordResetSuccess from './pages/PasswordResetSuccess.jsx';
import ResetPasswordEmailSent from './pages/ResetPasswordEmailSent.jsx';
import NotFound from './pages/NotFound.jsx';

function RequireAuth({ children }) {
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Перевіряємо сесію..." />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function RequireGuest({ children }) {
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Перевіряємо сесію..." />
      </div>
    );
  }

  return user ? <Navigate to="/profile" replace /> : children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/register"
          element={
            <RequireGuest>
              <Register />
            </RequireGuest>
          }
        />
        <Route
          path="/activate"
          element={
            <RequireGuest>
              <Activation />
            </RequireGuest>
          }
        />
        <Route
          path="/activate/:token"
          element={
            <RequireGuest>
              <Activation />
            </RequireGuest>
          }
        />
        <Route
          path="/login"
          element={
            <RequireGuest>
              <Login />
            </RequireGuest>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <RequireGuest>
              <ForgotPassword />
            </RequireGuest>
          }
        />
        <Route
          path="/reset-password"
          element={
            <RequireGuest>
              <ResetPassword />
            </RequireGuest>
          }
        />
        <Route
          path="/reset-password/sent"
          element={
            <RequireGuest>
              <ResetPasswordEmailSent />
            </RequireGuest>
          }
        />
        <Route
          path="/reset-password/success"
          element={
            <RequireGuest>
              <PasswordResetSuccess />
            </RequireGuest>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
