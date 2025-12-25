import { useEffect } from "react";
import { Routes, Route, Link, useNavigate, NavLink } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "bulma/css/bulma.css";
import "./styles.scss";

import { useAuth } from "./components/AuthContext";
import { usePageError } from "./hooks/usePageError";
import { Loader } from "./components/Loader";
import { HomePage } from "./pages/HomePage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { AccountActivationPage } from "./pages/AccountActivationPage";
import { LoginPage } from "./pages/LoginPage";
import { RequireAuth } from "./components/RequireAuth";
import { UsersPage } from "./pages/UsersPage";
import { AxiosError } from "axios";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PasswordResetConfirmPage } from "./pages/PasswordResetConfirmPage";
import { PasswordResetSentPage } from "./pages/PasswordResetSentPage";
import { PasswordResetRequestPage } from "./pages/PasswordResetRequestPage";
import { RequireNonAuth } from "./components/RequireNonAuth";
import { PasswordResetSuccessPage } from "./pages/PasswordResetSuccessPage";

export function App() {
  const navigate = useNavigate();
  const [error, setError] = usePageError("");
  const { isChecked, currentUser, logout, checkAuth } = useAuth();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (!isChecked) {
      checkAuth();
    }
  }, [isChecked]);

  if (!isChecked) {
    return <Loader />;
  }

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate("/login");
      })
      .catch((error: AxiosError<{ message?: string }>) => {
        setError(error.response?.data?.message ?? "");
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
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              {currentUser ? (
                <>
                  <NavLink
                    to="/profile"
                    className="button is-light has-text-weight-bold"
                  >
                    Profile
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
            <Route element={<RequireNonAuth />}>
              <Route path="sign-up" element={<RegistrationPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route
                path="activation/:email/:activationToken"
                element={<AccountActivationPage />}
              />
              <Route
                path="password-reset"
                element={<PasswordResetRequestPage />}
              />
              <Route
                path="password-reset/sent"
                element={<PasswordResetSentPage />}
              />
              <Route
                path="password-reset/confirm/:token"
                element={<PasswordResetConfirmPage />}
              />
              <Route
                path="password-reset/success"
                element={<PasswordResetSuccessPage />}
              />
            </Route>

            <Route element={<RequireAuth />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </section>

        {error && <p className="notification is-danger is-light">{error}</p>}
      </main>
    </>
  );
}
