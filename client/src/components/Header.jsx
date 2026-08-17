import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();

  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();

    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar is-light mb-6" role="navigation">
      <div className="container">
        <div className="navbar-brand">
          <Link className="navbar-item has-text-weight-bold" to="/">
            Auth App
          </Link>
        </div>

        <div className="navbar-menu is-active">
          <div className="navbar-end">
            {isAuthenticated ? (
              <>
                <Link className="navbar-item" to="/profile">
                  Profile
                </Link>

                <div className="navbar-item">
                  <button
                    className="button is-danger is-light"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link className="navbar-item" to="/login">
                  Login
                </Link>

                <Link className="navbar-item" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
