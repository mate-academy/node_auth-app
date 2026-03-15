import { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom';

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bulma/css/bulma.css';
import './styles.scss';

import { useAuth } from '../components/AuthContext';
import { usePageError } from '../hooks/usePageError';
import { Loader } from '../components/Loader';
import { HomePage } from './HomePage';
import { SignUpPage } from './SignUpPage';
import { AccountActivationPage } from './AccountActivationPage';
import { LoginPage } from './LoginPage';
import { RequireAuth } from '../components/RequireAuth';
import { ProfilePage } from './ProfilePage';
import { ChangePage } from './ChangePage';
import { ResetPassPage } from './ResetPassPage';
import { NotFoundPage } from './NotFoundPage';
import { catchError } from '../utils/catchError';

export function App() {
  const navigate = useNavigate();
  const [error, setError] = usePageError('');
  const { isChecked, currentUser, logout, checkAuth } = useAuth();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    checkAuth();
  }, []);

  if (!isChecked) {
    return <Loader />;
  }

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate('/login');
      })
      .catch((e) => catchError(e, setError));
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
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              {currentUser ? (
                <>
                  <NavLink to="/profile" className="profile_icon_box">
                    <i className="fa-solid fa-circle-user fa-xl"></i>
                  </NavLink>
                  <button
                    className="button is-light has-text-weight-bold"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </>
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
            <Route path="sign-up" element={<SignUpPage />} />
            <Route
              path="auth/activation/:email/:activationToken"
              element={<AccountActivationPage />}
            />
            <Route
              path="reset-password/:resetToken"
              element={<ResetPassPage />}
            />
            <Route path="reset-password" element={<ResetPassPage />} />
            <Route path="login" element={<LoginPage />} />

            <Route path="/" element={<RequireAuth />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route
                path="profile/change/:paramToChange"
                element={<ChangePage />}
              />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </section>

        {error && <p className="notification is-danger is-light">{error}</p>}
      </main>
    </>
  );
}
