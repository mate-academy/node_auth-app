import { NavLink, useNavigate } from 'react-router-dom';

import './Header.css';

import logo from '../../assets/logo.svg';
import { AuthUser } from '../../types/auth';
import { client } from '../../utils/client';

type Props = {
  authUser: AuthUser | null;
  onLogoutSuccess: () => void;
};

export const Header = ({ authUser, onLogoutSuccess }: Props) => {
  const navigate = useNavigate();
  const navLinks = [{ to: '/', label: 'Home', end: true }];

  if (authUser) {
    navLinks.push({ to: '/profile', label: 'Profile', end: false });
  } else {
    navLinks.push({ to: '/login', label: 'Log in | Sign up', end: false });
  }

  const handleLogout = async () => {
    try {
      await client.post('/logout', null);
    } finally {
      onLogoutSuccess();
      navigate('/login');
    }
  };

  return (
    <>
      <header className="Header">
        <div className="logo">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        <nav className="navigation">
          <ul className="menu">
            {navLinks.map(({ to, label, end }) => (
              <li key={to} className="link">
                <NavLink to={to} end={end}>
                  {label}
                </NavLink>
              </li>
            ))}
            {authUser && (
              <li className="link">
                <button className="link__button" type="button" onClick={handleLogout}>
                  Log out
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>
    </>
  );
};
