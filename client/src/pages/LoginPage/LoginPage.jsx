import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.scss';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Відправляємо дані на бекенд
      const response = await axios.post('http://localhost:5700/auth/login', {
        email,
        password,
      });

      // Викликаємо метод з контексту
      login(response.data.user, response.data.accessToken);

      // Перенаправляємо на головну
      navigate('/profile');
    } catch (err) {
      // Обробка помилок (наприклад, невірний пароль або неактивований акаунт)
      setError(err.response?.data?.message || 'Щось пішло не так');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h1>Вхід</h1>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="example@mail.com"
          />
        </div>

        <div className="field">
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Вхід...' : 'Увійти'}
        </button>
      </form>

      <p>
        Забули пароль? <Link to="/forgot-password">Відновлення пароля</Link>
      </p>

      <p>
        Немає акаунта? <Link to="/registration">Зареєструватися</Link>
      </p>

      <p>
        <Link to="/">Головна</Link>
      </p>


    </div>
  );
};
