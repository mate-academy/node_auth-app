import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import styles from './Header.module.scss';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null; // Не показуємо хедер, якщо не залогінені

  return (
    <nav className={styles.header}>
      <div className={styles.logo}>Accounting App</div>
      <ul className={styles.navLinks}>
        <li><Link to="/">Головна</Link></li>
        <li><Link to="/expenses">Витрати</Link></li>
        <li><Link to="/categories">Категорії</Link></li>
        <li><Link to="/profile">Профіль</Link></li>
      </ul>
      <div className={styles.userInfo}>
        <span>Привіт, {user.name}!</span>
        <button onClick={handleLogout} className={styles.logoutBtn}>Вийти</button>
      </div>
    </nav>
  );
};

export default Header;
