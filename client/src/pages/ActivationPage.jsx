import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { activateUser } from '../api/auth';

export default function ActivationPage() {
  const { activationToken } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  // У StrictMode (dev) ефект викликається двічі, а токен одноразовий —
  // другий запит повернув би помилку, тому захищаємося від дубля
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    activateUser(activationToken)
      .then(() => setStatus('success'))
      .catch((err) => {
        setMessage(err.message);
        setStatus('error');
      });
  }, [activationToken]);

  if (status === 'loading') {
    return (
      <section className="card">
        <h1>Активація акаунта</h1>
        <p>Перевіряємо посилання…</p>
      </section>
    );
  }

  if (status === 'success') {
    return (
      <section className="card">
        <h1>Акаунт активовано</h1>
        <p>Ваша пошта підтверджена. Тепер можна увійти в акаунт.</p>
        <Link to="/login" className="btn btn--primary">
          Увійти
        </Link>
      </section>
    );
  }

  return (
    <section className="card">
      <h1>Посилання не активне</h1>
      <p>
        {message ||
          'Це посилання недійсне або вже було використане.'}
      </p>
      <p className="card__footer">
        Спробуйте <Link to="/register">зареєструватися</Link> ще раз або{' '}
        <Link to="/login">увійти</Link>, якщо акаунт уже активований.
      </p>
    </section>
  );
}
