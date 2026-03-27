import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import { ActivationPage } from './pages/ActivationPage/ActivationPage';
import HomePage from './pages/HomePage/HomePage';
import { NotFound } from './pages/NotFound/NotFound';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import { RegistrationPage } from './pages/RegistrationPage/RegistrationPage';
import CategoriesPage from './pages/CategoriesPage/CategoriesPage';
import ExpensesPage from './pages/ExpensesPage/ExpensesPage';
import { Header } from './components/Header/Header';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage/ResetPasswordPage';
import { GuestRoute } from './components/GuestRoute';

export const Root = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<App />}>
          {/* ПУБЛІЧНІ МАРШРУТИ (доступні всім, наприклад, головна) */}
          <Route index element={<HomePage />} />
          <Route path="home" element={<Navigate replace to="/" />} />

          {/* ГOCТЬОВІ МАРШРУТИ (тільки для неавторизованих) */}
          <Route element={<GuestRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="registration" element={<RegistrationPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="auth/activate/:token" element={<ActivationPage />} />
          </Route>


          {/* ЗАХИЩЕНІ МАРШРУТИ (тільки для авторизованих) */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            {/* Тут можна додати інші приватні сторінки, наприклад /settings */}
          </Route>

          {/* 404 - Сторінка не знайдена */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
