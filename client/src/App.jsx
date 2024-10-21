import './styles.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';

import React, { useContext, useEffect } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ProfilePage } from './pages/ProfilePage';
import { AccountActivationPage } from './pages/AccountActivationPage';
import { RequireAuth } from './components/RequireAuth';
import { usePageError } from './hooks/usePageError';
import { AuthContext } from './components/AuthContext';
import { Loader } from './components/loader/Loader';
import { ResetPasswordRequest } from './pages/ResetPasswordRequest';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  const navigate = useNavigate();
  const [error, setError] = usePageError();
  const { isChecked, user, logout, checkAuth } = useContext(AuthContext);

  useEffect(() => {
    checkAuth();
  }, []);

  if (!isChecked) {
    return <Loader />;
  }

  const profileLink = user ? `/profile/change_name/${user.id}` : '/login';

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

          <NavLink to={profileLink} className="navbar-item">
            Profile
          </NavLink>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              {user ? (
                <button
                  className="button is-light has-text-weight-bold"
                  onClick={() => {
                    logout()
                      .then(() => {
                        navigate('/login');
                      })
                      .catch((error) => {
                        setError(error.response?.data?.message);
                      });
                  }}
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
            <Route path="reset-password" element={<ResetPasswordRequest />} />
            <Route
              path="activate/:activationToken"
              element={<AccountActivationPage />}
            />
            <Route
              path="reset-password/:activationToken"
              element={<ChangePasswordPage />}
            />
            <Route path="login" element={<LoginPage />} />

            <Route path="/" element={<RequireAuth />}>
              <Route
                path="profile/change_name/:userId"
                element={<ProfilePage />}
              />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </section>

        {error && <p className="notification is-danger is-light">{error}</p>}
      </main>
    </>
  );
};
