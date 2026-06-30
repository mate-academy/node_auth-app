import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { authService } from '../../services/auth.service';
import { type RootState } from '../../store';

const ProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [emailData, setEmailData] = useState({ newEmail: '', confirmPassword: '' });

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    await authService.updateProfile({ name });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return alert('Паролі не збігаються');
    await authService.updateProfile({
      oldPassword: passwords.old,
      newPassword: passwords.new,
      confirmation: passwords.confirm
    });
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    await authService.updateProfile({
      newEmail: emailData.newEmail,
      password: emailData.confirmPassword
    });
  };

  return (
    <div className="page-container profile-layout">
      <aside className="profile-sidebar">
        <div className="profile-avatar">{user?.name?.charAt(0) || 'U'}</div>
        <h3>{user?.name || 'Користувач'}</h3>
        <p>{user?.email || 'email@example.com'}</p>
        {user?.isActive && <span className="badge-active">Акаунт активовано</span>}
      </aside>

      <main className="profile-content">
        <h2>Налаштування профілю</h2>

        <section className="profile-section">
          <h3>Змінити ім'я</h3>
          <form className="profile-form" onSubmit={handleNameChange}>
            <div className="form-group">
              <label>Нове ім'я</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-secondary">Оновити ім'я</button>
          </form>
        </section>

        <section className="profile-section">
          <h3>Зміна безпеки (Пароль)</h3>
          <form className="profile-form" onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Старий пароль</label>
              <input
                type="password"
                value={passwords.old}
                onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Новий пароль</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Підтвердження нового пароля</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-secondary">Оновити пароль</button>
          </form>
        </section>

        <section className="profile-section">
          <h3>Змінити електронну пошту</h3>
          <form className="profile-form" onSubmit={handleEmailChange}>
            <div className="form-group">
              <label>Нова поштова адреса</label>
              <input
                type="email"
                value={emailData.newEmail}
                onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Поточний пароль</label>
              <input
                type="password"
                value={emailData.confirmPassword}
                onChange={(e) => setEmailData({...emailData, confirmPassword: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-secondary">Підтвердити зміну пошти</button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
