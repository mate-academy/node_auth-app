import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/api';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Об'єкт для відстеження окремих правил (для візуалізації)
  const validation = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
    match: password === confirmPassword && confirmPassword !== '',
  };

  const isFormValid = PASSWORD_REGEX.test(password) && validation.match;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      await api.post('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка скидання пароля');
    }
  };

  if (isSuccess) {
    return (
      <div className="container">
        <h1>Пароль успішно змінено! ✅</h1>
        <p>Тепер ви можете увійти з новим паролем.</p>
        <Link to="/login" className="button">Перейти до логіну</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Встановіть новий пароль</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Новий пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Візуальний список правил */}
        <ul className="password-hints">
          <li className={validation.length ? 'valid' : 'invalid'}>Мінімум 8 символів</li>
          <li className={validation.upper ? 'valid' : 'invalid'}>Велика літера (A-Z)</li>
          <li className={validation.number ? 'valid' : 'invalid'}>Цифра (0-9)</li>
          <li className={validation.special ? 'valid' : 'invalid'}>Спецсимвол (@$!%*?&)</li>
        </ul>

        <input
          type="password"
          placeholder="Підтвердіть пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {confirmPassword && !validation.match && (
          <p className="error-text">Паролі не збігаються</p>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={!isFormValid}>Змінити пароль</button>
      </form>

      <style>{`
        .password-hints { font-size: 0.85rem; list-style: none; padding: 0; margin: 10px 0; }
        .valid { color: green; }
        .valid::before { content: "✓ "; }
        .invalid { color: gray; }
        .invalid::before { content: "○ "; }
        .error-text { color: red; font-size: 0.8rem; margin-top: -10px; margin-bottom: 10px; }
        button:disabled { background-color: #ccc; cursor: not-allowed; }
      `}</style>
    </div>
  );
};
