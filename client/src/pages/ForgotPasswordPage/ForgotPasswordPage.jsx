import { useState } from 'react';
import api from '../../api/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSent(true); // Показуємо "Email sent page"
    } catch (err) {
      setError(err.response?.data?.message || 'Щось пішло не так');
    }
  };

  if (isSent) {
    return (
      <div className="container">
        <h1>Перевірте пошту 📧</h1>
        <p>Ми надіслали інструкції для скидання пароля на {email}.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Відновлення пароля</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Введіть ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Надіслати посилання</button>
      </form>
    </div>
  );
};
