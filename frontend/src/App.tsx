import { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom';

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bulma/css/bulma.css';
import './styles.scss';

import { useAuth } from './components/AuthContext';
import { usePageError } from './hooks/usePageError';
import { Loader } from './components/Loader';
import { HomePage } from './pages/HomePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { AccountActivationPage } from './pages/AccountActivationPage';
import { LoginPage } from './pages/LoginPage';
import { RequireAuth } from './components/RequireAuth';
import { UsersPage } from './pages/UsersPage';
import { AxiosError } from 'axios';
import { ProfilePage } from './pages/ProfilePage';
import { EmailConfirmationPage } from './pages/EmailConfirmationPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

export function App() {
  const navigate = useNavigate();
  const [error, setError] = usePageError('');
  const { isChecked, currentUser, logout, checkAuth } = useAuth();

  useEffect(() => {
  const initAuth = async () => {
    await checkAuth();
  };

  void initAuth();
  
}, [checkAuth]);


  if (!isChecked) {
    return <Loader />;
  }

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate('/');
      })
      .catch((error: AxiosError<{ message?: string }>) => {
        setError(error.response?.data?.message ?? '');
      });
  };

  return (
    <>
      <nav
        className="navbar has-shadow"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-start">
          <NavLink to="/" className="navbar-item">
            Home
          </NavLink>

          <NavLink to="/users" className="navbar-item">
            Users
          </NavLink>
          <NavLink to="/profile" className="navbar-item">
            Profile
          </NavLink>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              {currentUser ? (
                <button
                  className="button is-light has-text-weight-bold"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              ) : (
                <>
                  <Link
                    to="/sign-up"
                    className="button is-light has-text-weight-bold"
                  >
                    Sign up
                  </Link>

                  <Link
                    to="/login"
                    className="button is-success has-text-weight-bold"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="section">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="sign-up" element={<RegistrationPage />} />
            <Route
              path="activate/:email/:activationToken"
              element={<AccountActivationPage />}
            />
            <Route
              path="confirm-email/:emailToken"
              element={< EmailConfirmationPage />}
            />
            <Route path="login" element={<LoginPage />} />

            <Route path="forgot-password" element={<ForgotPasswordPage />} />

         <Route path="reset-password/:resetToken" element={<ResetPasswordPage />} />

            <Route path="/" element={<RequireAuth />}>
              <Route path="users" element={<UsersPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route> 
          </Routes>
        </section>

        {error && <p className="notification is-danger is-light">{error}</p>}
      </main>
    </>
  );
}
