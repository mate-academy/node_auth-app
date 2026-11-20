import React, { useContext, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom';

import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles.scss';

import { AccountActivationPage } from './pages/AccountActivationPage';
import { AuthContext } from './components/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { RequireAuth } from './components/RequireAuth';
import { Loader } from './components/Loader.jsx';
import { usePageError } from './hooks/usePageError.js';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { ProfileContext } from './components/ProfileContext.jsx';
import { EmailActivationPage } from './pages/EmailActivationPage.jsx';
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx';
import { ResetPasswordConfirmationPage } from './pages/ResetPasswordConfirmationPage.jsx';
import { GuestRoute } from './components/GuestRoute.jsx';

function App() {
  const navigate = useNavigate();
  const [error, setError] = usePageError();
  const { isChecked, user, logout, checkAuth } = useContext(AuthContext);
  const { getProfile } = useContext(ProfileContext);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user?.id) {
      getProfile();
    }
  }, [user?.id]);

  if (!isChecked) {
    return <Loader />;
  }

  return (
    <>
      <nav
        className="navbar has-shadow"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-start">
          <NavLink to="/profile" className="navbar-item">
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
                      .catch(error => {
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
            <Route path="/" element={<GuestRoute />}>
              <Route path="sign-up" element={<RegistrationPage />} />
              <Route
                path="activate/:activationToken"
                element={<AccountActivationPage />}
              />
              <Route path="login" element={<LoginPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/passwordReset/activation/:activationToken"
                element={<ResetPasswordConfirmationPage />}
              />
              <Route
                path="/changeEmail/activation/:activationToken"
                element={<EmailActivationPage />}
              />
            </Route>

            <Route path="/" element={<RequireAuth />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </section>

        {error && <p className="notification is-danger is-light">{error}</p>}
      </main>
    </>
  );
}

export default App;
