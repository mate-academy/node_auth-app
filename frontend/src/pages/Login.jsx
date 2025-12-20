import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Input from '../components/Input.jsx';
import PageCard from '../components/PageCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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

    try {
      const res = await login({
        email: form.email.trim(),
        password: form.password,
      });

      if (res.needsActivation) {
        setMessage('Email не активований. Перейдіть за посиланням у листі.');
        setTimeout(() => navigate('/activate'), 500);
        return;
      }

      navigate('/profile');
    } catch (e) {
      setError(e.message || 'Не вдалося увійти.');
    }
  };

  return (
    <PageCard title="Вхід" subtitle="Увійдіть за email та паролем.">
      <Alert type="success" message={message} />
      <Alert type="error" message={error} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Input
          label="Пароль"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />

        <button type="submit" className="btn-primary w-full py-3 text-base" disabled={isLoading}>
          {isLoading ? 'Входимо...' : 'Увійти'}
        </button>
      </form>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <Link className="text-primary underline" to="/register">
          Зареєструватися
        </Link>
        <Link className="text-primary underline" to="/forgot-password">
          Забули пароль?
        </Link>
      </div>
    </PageCard>
  );
}
