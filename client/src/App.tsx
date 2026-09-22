import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import { useEffect } from 'react';
import { Loader } from './components/Loader';
import type { AxiosError } from 'axios';
import { usePageError } from './hooks/usePageError';
import { HomePage } from './pages/HomePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { AccountActivationPage } from './pages/AccountActivationPage';
import { LoginPage } from './pages/LoginPage';
import { RequireAuth } from './components/RequireAuth';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { EmailConfirmationPage } from './pages/EmailConfirmationPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  const navigate = useNavigate();
  const [error, setError] = usePageError('');
  const { isChecked, currentUser, logout, checkAuth } = useAuth();

  useEffect(() => {
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
      .catch((error: AxiosError<{ message?: string }>) => {
        setError(error.response?.data?.message ?? '');
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="mr-6 text-lg font-bold tracking-tight text-slate-900"
            >
              Auth<span className="text-indigo-600">System</span>
            </Link>

            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/users"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              Users
            </NavLink>

            {currentUser && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                Profile
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  to="/sign-up"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Sign up
                </Link>

                <Link
                  to="/login"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sign-up" element={<RegistrationPage />} />

            <Route
              path="activate/:email/:activationToken"
              element={<AccountActivationPage />}
            />

            <Route path="login" element={<LoginPage />} />

            <Route path="forgot-password" element={<ForgotPasswordPage />} />

            <Route
              path="reset-password/:token"
              element={<ResetPasswordPage />}
            />

            <Route
              path="/email-confirmed"
              element={<EmailConfirmationPage />}
            />

            <Route element={<RequireAuth />}>
              <Route path="users" element={<UsersPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {error && (
            <div className="mx-auto mt-6 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
