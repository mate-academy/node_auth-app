import React, { useContext } from 'react';
import cn from 'classnames';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { AllUsersPage } from './components/pages/AllUsersPage';
import { SignUpPage } from './components/pages/SignUpPage';
import { LoginPage } from './components/pages/LoginPage';
import { VerifyEmailPage } from './components/pages/VerifyEmailPage';
import { UserPage } from './components/pages/UserPage';
import { AuthContext } from './components/AuthContext';
import { ResetPassword } from './components/pages/ResetPassword';
import { SetNewPassword } from './components/pages/SetNewPassword';

export const App: React.FC = () => {
  const navigate = useNavigate();
  const { user, onLogOutUser } = useContext(AuthContext);

  return (
    <div className="container">
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item" href="https://bulma.io">
            <img src={'https://en.wikipedia.org/static/images/icons/wikipedia.png'} />
          </a>

          <a
            role="button"
            className="navbar-burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div className="navbar-menu">
          <div className="navbar-start">
            <NavLink
              to={'/'}
              className={({ isActive }) =>
                cn('navbar-item', {
                  'has-background-grey-lighter': isActive,
                })
              }
            >
              Public page
            </NavLink>

            <NavLink
              to={'/users'}
              className={({ isActive }) =>
                cn('navbar-item', {
                  'has-background-grey-lighter': isActive,
                })
              }
            >
              Protected page
            </NavLink>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              {user ? (
                <div className="navbar-item has-dropdown is-hoverable">
                  <a className="navbar-link is-success">{user.name}</a>

                  <div className="navbar-dropdown">
                    <NavLink
                      to={'/user'}
                      className={({ isActive }) =>
                        cn('navbar-item', {
                          'has-background-grey-lighter': isActive,
                        })
                      }
                    >
                      Profile
                    </NavLink>
                    <button
                      onClick={() => {
                        onLogOutUser();
                        navigate('/login');
                      }}
                      className="navbar-item"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="buttons">
                  <NavLink to={'/login'} className="button is-primary">
                    <strong>Log in</strong>
                  </NavLink>
                  <NavLink to={'/signup'} className="button is-light">
                    Sign up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1 className="title is-1">Public page</h1>
            </>
          }
        />
        <Route path="/users" element={<AllUsersPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />
      </Routes>
    </div>
  );
};
