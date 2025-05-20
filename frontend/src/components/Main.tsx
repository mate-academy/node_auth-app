import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ActivationPage from './pages/ActivationPage';
import EditPage from './pages/EditPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LogoutPage from './pages/LogoutPage';

const Main = () => {
  return (
    <main className="px-4 py-2">
      <Routes>
        <Route path="/">
          <Route index element={<HomePage />} />

          <Route path="edit" element={<EditPage />} />

          <Route path="sign-up" element={<SignUpPage />} />

          <Route path="login" element={<LoginPage />} />

          <Route path="logout" element={<LogoutPage />} />

          <Route path="reset-password" element={<ResetPasswordPage />} />

          <Route
            path="activate/:activationToken"
            element={<ActivationPage />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </main>
  );
};

export default Main;
