import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <Link to="/" className="header__logo">
        MyApp
      </Link>

      <nav className="header__nav">
        {isAuthenticated ? (
          <>
            <NavLink to="/profile" className="btn btn--ghost">
              {user.name || user.email}
            </NavLink>
            <button className="btn btn--primary" onClick={handleLogout}>
              Exit
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn--ghost">
              Log in
            </NavLink>
            <NavLink to="/register" className="btn btn--primary">
              Sign up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
