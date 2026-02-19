import React, { useContext, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom';

import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles.scss';

import { AccountActivationPage } from './pages/AccountActivationPage';
import { AuthContext } from './components/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { RequireAuth } from './components/RequireAuth';
import { UsersPage } from './pages/UsersPage';
import { Loader } from './components/Loader.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { usePageError } from './hooks/usePageError.js';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { EmailConfirmPage } from './pages/EmailConfirmationPage.jsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx';
import { RequireNonAuth } from './components/RequireNonAuth.jsx';

function App() {
  const navigate = useNavigate();
  const [error, setError] = usePageError();
  const { isChecked, user, logout, checkAuth } = useContext(AuthContext);

  useEffect(() => {
    checkAuth();
  }, []);

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
          <NavLink to="/" className="navbar-item">
            Home
          </NavLink>

          <NavLink to="/users" className="navbar-item">
            Users
          </NavLink>

          {user &&
            <NavLink to="/profile" className="navbar-item">
              Profile
            </NavLink>
          }
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
                    to="/registration"
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
            <Route path="registration" element={
              <RequireNonAuth>
                <RegistrationPage />
              </RequireNonAuth>
            } />
            <Route
              path="activate/:activationToken"
              element={<AccountActivationPage />}
            />
            <Route
              path="confirm-email-change/:activationToken"
              element={
                <RequireNonAuth>
                  <EmailConfirmPage />
                </RequireNonAuth>
              }
            />
            <Route path="login" element={
              <RequireNonAuth>
                <LoginPage />
              </RequireNonAuth>
            } />
            <Route path="forgot-password" element={
              <RequireNonAuth>
                <ForgotPasswordPage />
              </RequireNonAuth>
            } />
            <Route path="reset-password/:activationToken" element={
              <RequireNonAuth>
                <ResetPasswordPage />
              </RequireNonAuth>
            } />
            <Route path="/" element={<RequireAuth />}>
              <Route path="users" element={<UsersPage />} />
            </Route>
            <Route path="/" element={<RequireAuth />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route
              path="*"
              element={
                <section className="section">
                  <h1 className="title">Page not found</h1>
                  <p>Sorry, we couldn't find the page you're looking for.</p>
                  <a href="/" className="button is-link mt-4">Go Home</a>
                </section>
              }
            />
          </Routes>
        </section>

        {error && <p className="notification is-danger is-light">{error}</p>}
      </main>
    </>
  );
}

export default App;
