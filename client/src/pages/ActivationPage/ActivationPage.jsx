import { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
import api from '../../api/api';
import { useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';

export const ActivationPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const activated = useRef(false); // Використовуємо ref, щоб запобігти подвійному запиту
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Якщо ми вже відправили запит у цьому сеансі — ігноруємо другий виклик
    if (activated.current) return;

    activated.current = true; // Помічаємо, що запит пішов

    const activate = async () => {
      try {
        // Запит до нашого бекенду (CORS ми вже налаштували!)
        // const response = await axios.get(
        //   `http://localhost:5700/auth/activate/${token}`,
        //   { withCredentials: true },
        // );

        // Використовуємо api, він вже знає про baseURL та credentials
        const response = await api.get(`/auth/activate/${token}`);

        // Отримуємо дані з відповіді бекенду
        const { user } = response.data;

        if (user) {
          // Викликаємо функцію з AuthContext
          // Це запише user в стейт і встановить axios заголовок
          login(user);

          setStatus('success');
          // Використовуємо navigate з маленької літери (хук useNavigate)
          navigate('/profile');
        }

        // login(user, accessToken);
        // setStatus('success');
        // navigate('/profile');
      } catch (err) {
        console.error('Помилка активації:', err);
        setStatus('error');
      }
    };

    if (token) {
      activate();
    }
  }, [token, login, navigate]);

  return (
    <div className="activation-container">
      {status === 'loading' && <h1>Активація акаунта... зачекайте</h1>}

      {status === 'success' && (
        <>
          <h1>Акаунт активовано успішно! ✅</h1>
          <p>Тепер ви можете увійти у свій профіль.</p>
          <Link to="/login" className="button">
            Перейти до логіну
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <h1>Помилка активації ❌</h1>
          <p>Токен недійсний, застарів або акаунт уже активовано.</p>
          <Link to="/" className="button">
            На головну
          </Link>
        </>
      )}
    </div>
  );
};
