import { useState } from 'react';
import Alert from '../components/Alert.jsx';
import Input from '../components/Input.jsx';
import PageCard from '../components/PageCard.jsx';
import PasswordRules from '../components/PasswordRules.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authClient } from '../services/authClient.js';
import { isPasswordStrong } from '../utils/password.js';

export default function Profile() {
  const { user, updateProfile, token, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [passStatus, setPassStatus] = useState('');
  const [passError, setPassError] = useState('');

  const [emailForm, setEmailForm] = useState({ password: '', newEmail: '', confirm: '' });
  const [emailStatus, setEmailStatus] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleNameSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');

    try {
      const res = await updateProfile({ name: name.trim() }, token);
      setStatus(res.message ?? 'Дані оновлено.');
    } catch (e) {
      setError(e.message || 'Не вдалося оновити профіль.');
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPassError('');
    setPassStatus('');

    if (passForm.newPassword !== passForm.confirm) {
      setPassError('Паролі не збігаються.');
      return;
    }

    if (!isPasswordStrong(passForm.newPassword)) {
      setPassError('Новий пароль не відповідає правилам.');
      return;
    }

    try {
      const res = await authClient.changePassword(
        { oldPassword: passForm.oldPassword, newPassword: passForm.newPassword },
        token,
      );
      setPassStatus(res.message ?? 'Пароль змінено.');
      setPassForm({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      setPassError(e.message || 'Не вдалося змінити пароль.');
    }
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setEmailError('');
    setEmailStatus('');

    if (emailForm.newEmail !== emailForm.confirm) {
      setEmailError('Email не збігаються.');
      return;
    }

    try {
      const res = await authClient.changeEmail(
        { password: emailForm.password, newEmail: emailForm.newEmail.trim() },
        token,
      );
      setEmailStatus(res.message ?? 'Email змінено.');
      setUser(res.user ?? user);
      setEmailForm({ password: '', newEmail: '', confirm: '' });
    } catch (e) {
      setEmailError(e.message || 'Не вдалося змінити email.');
    }
  };

  return (
    <div className="space-y-8">
      <PageCard
        title="Профіль"
        subtitle="Ваш статус та налаштування. Зміни збережуться одразу."
        footer={
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
              {user?.active ? 'Email підтверджено' : 'Email не підтверджено'}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
              {user?.email}
            </span>
          </div>
        }
      >
        <Alert type="success" message={status} />
        <Alert type="error" message={error} />

        <form className="space-y-3" onSubmit={handleNameSubmit}>
          <Input
            label="Ім'я"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary w-full sm:w-auto">
            Оновити ім'я
          </button>
        </form>
      </PageCard>

      <PageCard title="Змінити пароль" subtitle="Потрібно вказати старий пароль.">
        <Alert type="success" message={passStatus} />
        <Alert type="error" message={passError} />

        <form className="space-y-3" onSubmit={handlePasswordSubmit}>
          <Input
            label="Поточний пароль"
            name="oldPassword"
            type="password"
            value={passForm.oldPassword}
            onChange={(e) => setPassForm((prev) => ({ ...prev, oldPassword: e.target.value }))}
            required
            autoComplete="current-password"
          />

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Новий пароль"
              name="newPassword"
              type="password"
              value={passForm.newPassword}
              onChange={(e) => setPassForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              required
              autoComplete="new-password"
            />
            <Input
              label="Підтвердження пароля"
              name="confirm"
              type="password"
              value={passForm.confirm}
              onChange={(e) => setPassForm((prev) => ({ ...prev, confirm: e.target.value }))}
              required
              autoComplete="new-password"
            />
          </div>

          <PasswordRules password={passForm.newPassword} />

          <button type="submit" className="btn-primary w-full sm:w-auto">
            Змінити пароль
          </button>
        </form>
      </PageCard>

      <PageCard title="Змінити email" subtitle="Підтвердьте пароль та нову адресу. Ми повідомимо старий email.">
        <Alert type="success" message={emailStatus} />
        <Alert type="error" message={emailError} />

        <form className="space-y-3" onSubmit={handleEmailSubmit}>
          <Input
            label="Пароль"
            name="password"
            type="password"
            value={emailForm.password}
            onChange={(e) => setEmailForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            autoComplete="current-password"
          />
          <Input
            label="Новий email"
            name="newEmail"
            type="email"
            value={emailForm.newEmail}
            onChange={(e) => setEmailForm((prev) => ({ ...prev, newEmail: e.target.value }))}
            required
            autoComplete="email"
          />
          <Input
            label="Підтвердження email"
            name="confirm"
            type="email"
            value={emailForm.confirm}
            onChange={(e) => setEmailForm((prev) => ({ ...prev, confirm: e.target.value }))}
            required
            autoComplete="email"
          />

          <button type="submit" className="btn-primary w-full sm:w-auto">
            Змінити email
          </button>
        </form>
      </PageCard>
    </div>
  );
}
