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
import Header from './components/Header/Header';

export const Root = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<Navigate replace to="/" />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registration" element={<RegistrationPage />} />

          <Route path="auth/activate/:token" element={<ActivationPage />} />

          {/* ЗАХИЩЕНІ МАРШРУТИ */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            {/* Тут можна додати інші приватні сторінки, наприклад /settings */}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
