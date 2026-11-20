import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="header__logo">
        MyApp
      </Link>

      <nav className="header__nav">
        <NavLink to="/login" className="btn btn--ghost">
          Увійти
        </NavLink>
        <NavLink to="/register" className="btn btn--primary">
          Реєстрація
        </NavLink>
      </nav>
    </header>
  );
}
