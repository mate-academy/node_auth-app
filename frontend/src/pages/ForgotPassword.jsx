import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Input from '../components/Input.jsx';
import PageCard from '../components/PageCard.jsx';
import { authClient } from '../services/authClient.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await authClient.requestReset({ email: email.trim() });
      setMessage(res.message ?? 'Ми надіслали інструкцію на пошту.');
      setTimeout(() => navigate('/reset-password/sent'), 500);
    } catch (e) {
      setError(e.message || 'Не вдалося надіслати лист.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageCard title="Відновлення пароля" subtitle="Вкажіть email і ми надішлемо інструкцію.">
      <Alert type="success" message={message} />
      <Alert type="error" message={error} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
          {loading ? 'Надсилаємо...' : 'Надіслати лист'}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        Згадали пароль?{' '}
        <Link className="text-primary underline" to="/login">
          Повернутися до входу
        </Link>
      </p>
    </PageCard>
  );
}
