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
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route
            path="/activation/:activationToken"
            element={<ActivationPage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
