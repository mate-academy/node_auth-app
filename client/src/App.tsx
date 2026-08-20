import { Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthLayout } from './modules/shared/layouts/AuthLayout/AuthLayout';
import { PrivateRoute } from './modules/shared/routes/PrivateRoute';
import { GuestRoute } from './modules/shared/routes/GuestRoute';
import { MainLayout } from './modules/shared/layouts/MainLayout';
import { MainPage } from './modules/MainPage';
import { LoginPage } from './modules/LoginPage';
import { RegisterPage } from './modules/RegisterPage';
import { ActivationPage } from './modules/ActivationPage';
import { ForgotPasswordPage } from './modules/ForgotPasswordPage';
import { ResetPasswordPage } from './modules/ResetPasswordPage';
import { ProfilePage } from './modules/ProfilePage/ProfilePage';
import { ConfirmEmailPage } from './modules/ConfirmEmailPage';
import { NotFoundPage } from './modules/NotFoundPage';

const App = () => {
  return (
    <Routes>
      <Route path={'/'} element={<MainLayout />}>
        <Route index element={<MainPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route element={<GuestRoute />}>
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route path="activation/:token" element={<ActivationPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="change-email/:token" element={<ConfirmEmailPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
