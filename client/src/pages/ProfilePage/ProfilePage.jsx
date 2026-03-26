import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import './ProfilePage.scss';

// Налаштовуємо axios для роботи з куками (якщо ще не зробив глобально)
axios.defaults.withCredentials = true;

const ProfilePage = () => {
  const { user, logout, setUser } = useContext(AuthContext);

  // Стейт для форм
  const [name, setName] = useState(user?.name || '');
  // const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [emails, setEmails] = useState({ password: '', newEmail: '', confirmEmail: '' });

  const [message, setMessage] = useState({ text: '', type: '' }); // для фідбеку

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // 1. Зміна імені
  const handleUpdateName = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5700/users/me/name', { name });
      setUser({ ...user, name }); // Оновлюємо ім'я в контексті
      showMessage('Ім’я успішно оновлено');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Помилка оновлення імені', 'error');
    }
  };

  // 2. Зміна пароля
  // const handleUpdatePassword = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await axios.put('http://localhost:5700/users/me/password', passwords);
  //     setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
  //     showMessage('Пароль успішно змінено');
  //   } catch (err) {
  //     showMessage(err.response?.data?.message || 'Помилка зміни пароля', 'error');
  //   }
  // };

  // 3. Зміна Email (важлива дія)
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5700/users/me/email', emails);
      showMessage('Email змінено! Перевірте пошту для активації.');
      // Оскільки бекенд розлогінює після зміни email, нам треба очистити контекст через пару секунд
      setTimeout(() => logout(), 3000);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Помилка зміни Email', 'error');
    }
  };

  return (
    <div className="profile-container">
      <h1>Налаштування профілю</h1>

      {message.text && (
        <div className={`notification ${message.type}`}>{message.text}</div>
      )}

      {/* Секція імені */}
      <section className="profile-section">
        <h3>Особисті дані</h3>
        <form onSubmit={handleUpdateName}>
          <div className="field">
            <label>Ваше ім'я</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button type="submit">Оновити ім'я</button>
        </form>
      </section>

      <hr />

      {/* Секція пароля */}
      {/* <section className="profile-section">
        <h3>Зміна пароля</h3>
        <form onSubmit={handleUpdatePassword}>
          <input
            type="password"
            placeholder="Поточний пароль"
            value={passwords.oldPassword}
            onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
          />
          <input
            type="password"
            placeholder="Новий пароль"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
          />
          <input
            type="password"
            placeholder="Підтвердіть новий пароль"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
          />
          <button type="submit">Змінити пароль</button>
        </form>
      </section> */}

      {/* <hr /> */}

      {/* Секція Email */}
      <section className="profile-section">
        <h3>Зміна Email</h3>
        <p className="warning">Увага: після зміни email акаунт потрібно буде активувати знову.</p>
        <form onSubmit={handleUpdateEmail}>
          <input
            type="password"
            placeholder="Введіть поточний пароль"
            value={emails.password}
            onChange={(e) => setEmails({...emails, password: e.target.value})}
          />
          <input
            type="email"
            placeholder="Новий Email"
            value={emails.newEmail}
            onChange={(e) => setEmails({...emails, newEmail: e.target.value})}
          />
          <input
            type="email"
            placeholder="Підтвердіть новий Email"
            value={emails.confirmEmail}
            onChange={(e) => setEmails({...emails, confirmEmail: e.target.value})}
          />
          <button type="submit" className="danger">Оновити Email</button>
        </form>
      </section>

      <button onClick={logout} className="button logout-btn">Вийти з системи</button>
    </div>
  );
};

export default ProfilePage;
