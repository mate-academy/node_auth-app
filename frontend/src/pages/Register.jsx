import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Input from '../components/Input.jsx';
import PageCard from '../components/PageCard.jsx';
import PasswordRules from '../components/PasswordRules.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { isPasswordStrong } from '../utils/password.js';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (form.password !== form.confirm) {
      setError('Паролі не збігаються.');
      return;
    }

    if (!isPasswordStrong(form.password)) {
      setError('Дотримуйтесь правил пароля.');
      return;
    }

    try {
      const res = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setMessage(res.message ?? 'Реєстрація успішна. Перевірте пошту для активації.');
      setForm((prev) => ({ ...prev, password: '', confirm: '' }));
      setTimeout(() => navigate('/activate'), 500);
    } catch (e) {
      setError(e.message || 'Не вдалося зареєструватися.');
    }
  };

  return (
    <PageCard title="Реєстрація" subtitle="Створіть акаунт та підтвердьте email для доступу.">
      <Alert type="success" message={message} />
      <Alert type="error" message={error} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Ім'я"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Іван"
          required
          autoComplete="name"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Пароль"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          <Input
            label="Підтвердження пароля"
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <PasswordRules password={form.password} />

        <button type="submit" className="btn-primary w-full py-3 text-base" disabled={isLoading}>
          {isLoading ? 'Створюємо...' : 'Зареєструватися'}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        Вже є акаунт?{' '}
        <Link className="text-primary underline" to="/login">
          Увійти
        </Link>
      </p>
    </PageCard>
  );
}
