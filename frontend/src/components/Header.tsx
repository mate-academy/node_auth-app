import { NavLink, useNavigate } from 'react-router-dom';
import { styles } from '../utils/styles';
import { useContext } from 'react';
import { UserContext } from '../features/user/UserContext';
import { privateAxiosInstance } from '../api/axios';

const Header = () => {
  const isActive = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? styles.header.nav.navlink.active
      : styles.header.nav.navlink.unactive;

  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
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
            <NavLink
              to="logout"
              className={isActive}
              onClick={async () => {
                if (!window.confirm('Are you sure?')) return;
                await privateAxiosInstance.get('/logout');
                setUser(null);
                navigate('/');
              }}
            >
              Logout
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
