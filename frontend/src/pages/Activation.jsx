import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import PageCard from '../components/PageCard.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Activation() {
  const { token: tokenFromUrl } = useParams();
  const navigate = useNavigate();
  const { activate, isLoading } = useAuth();
  const [token, setToken] = useState(tokenFromUrl || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [autoTried, setAutoTried] = useState(false);

  useEffect(() => {
    const autoActivate = async () => {
      if (!tokenFromUrl || autoTried) return;

      setAutoTried(true);
      try {
        const res = await activate(tokenFromUrl);
        setMessage(res.message ?? 'Акаунт активовано');
        setTimeout(() => navigate('/profile'), 600);
      } catch (e) {
        setError(e.message || 'Не вдалося активувати акаунт.');
      }
    };

    autoActivate();
  }, [activate, tokenFromUrl, autoTried, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await activate(token);
      setMessage(res.message ?? 'Акаунт активовано');
      setTimeout(() => navigate('/profile'), 600);
    } catch (e) {
      setError(e.message || 'Не вдалося активувати акаунт.');
    }
  };

  return (
    <PageCard
      title="Активація акаунту"
      subtitle="Ми надіслали лист із посиланням для активації. Перейдіть за ним або вставте токен нижче."
    >
      <Alert type="success" message={message} />
      <Alert type="error" message={error} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          <span>Токен активації</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Вставте токен із листа"
            required
          />
        </label>

        <button type="submit" className="btn-primary w-full py-3 text-base" disabled={isLoading}>
          {isLoading ? 'Активуємо...' : 'Активувати'}
        </button>
      </form>

      {isLoading && !tokenFromUrl ? <Spinner label="Перевіряємо посилання..." /> : null}

      <p className="text-sm text-slate-600">
        Не отримали лист? <span className="font-semibold">Перевірте спам</span> або повторіть реєстрацію.
      </p>

      <p className="text-sm text-slate-600">
        Ще не маєте акаунту?{' '}
        <Link className="text-primary underline" to="/register">
          Зареєструватися
        </Link>
      </p>
    </PageCard>
  );
}
