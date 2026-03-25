import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useRef } from 'react';

export const ActivationPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const activated = useRef(false); // Використовуємо ref, щоб запобігти подвійному запиту

  useEffect(() => {
    // Якщо ми вже відправили запит у цьому сеансі — ігноруємо другий виклик
    if (activated.current) return;

    activated.current = true; // Помічаємо, що запит пішов

    const activate = async () => {
      try {
        // Запит до нашого бекенду (CORS ми вже налаштували!)
        await axios.get(`http://localhost:5700/auth/activate/${token}`);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };

    if (token) {
      activate();
    }
  }, [token]);

  return (
    <div className="activation-container">
      {status === 'loading' && <h1>Активація акаунта... зачекайте</h1>}

      {status === 'success' && (
        <>
          <h1>Акаунт активовано успішно! ✅</h1>
          <p>Тепер ви можете увійти у свій профіль.</p>
          <Link to="/login" className="button">Перейти до логіну</Link>
        </>
      )}

      {status === 'error' && (
        <>
          <h1>Помилка активації ❌</h1>
          <p>Токен недійсний, застарів або акаунт уже активовано.</p>
          <Link to="/" className="button">На головну</Link>
        </>
      )}
    </div>
  );
};
