import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/api';
import { ValidationPassword } from '../../components/ValidationPassword';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  const isFormValid = isValid && password === confirmPassword && confirmPassword !== '';

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

        <ValidationPassword password={password} setValid={setIsValid} />

        <input
          type="password"
          placeholder="Підтвердіть пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {confirmPassword && password !== confirmPassword && confirmPassword !== '' && (
          <p style={{ color: 'red' }}>Паролі не збігаються</p>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={!isFormValid}>Змінити пароль</button>
      </form>
    </div>
  );
};
