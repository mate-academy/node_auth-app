import { NavLink } from 'react-router-dom';
import { styles } from '../utils/styles';
import { useContext } from 'react';
import { UserContext } from '../features/user/UserContext';

const Header = () => {
  const isActive = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? styles.header.nav.navlink.active
      : styles.header.nav.navlink.unactive;

  const { user } = useContext(UserContext);
  return (
    <header>
      <nav className={styles.header.nav.container}>
        <div className={styles.header.nav.linkContainer}>
          <NavLink to="" className={isActive}>
            Home
          </NavLink>

          {user && (
            <NavLink to="edit" className={isActive}>
              Edit
            </NavLink>
          )}
        </div>
        <div className={styles.header.nav.linkContainer}>
          {!user && (
            <NavLink to="sign-up" className={isActive}>
              Sign up
            </NavLink>
          )}

          {!user && (
            <NavLink to="login" className={isActive}>
              Login
            </NavLink>
          )}

          {user && (
            <NavLink to="logout" className={isActive}>
              Logout
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
