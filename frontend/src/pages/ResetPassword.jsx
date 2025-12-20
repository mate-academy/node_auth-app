import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Input from '../components/Input.jsx';
import PageCard from '../components/PageCard.jsx';
import PasswordRules from '../components/PasswordRules.jsx';
import { authClient } from '../services/authClient.js';
import { isPasswordStrong } from '../utils/password.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = params.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const hasToken = useMemo(() => Boolean(token?.length), [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirm) {
      setError('Паролі не збігаються.');
      return;
    }

    if (!isPasswordStrong(password)) {
      setError('Пароль не відповідає правилам.');
      return;
    }

    setLoading(true);
    try {
      const res = await authClient.resetPassword({ token, password });
      setMessage(res.message ?? 'Пароль змінено.');
      setTimeout(() => navigate('/reset-password/success'), 600);
    } catch (e) {
      setError(e.message || 'Не вдалося змінити пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageCard
      title="Новий пароль"
      subtitle="Введіть токен з листа та придумайте новий пароль."
    >
      <Alert type="success" message={message} />
      <Alert type="error" message={error} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Токен відновлення"
          name="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          placeholder="Вставте токен з листа"
        />

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Новий пароль"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Input
            label="Підтвердження пароля"
            name="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <PasswordRules password={password} />

        <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading || !hasToken}>
          {loading ? 'Зберігаємо...' : 'Оновити пароль'}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        Пригадали пароль?{' '}
        <Link className="text-primary underline" to="/login">
          Повернутися до входу
        </Link>
      </p>
    </PageCard>
  );
}
