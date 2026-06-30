import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';

interface AxiosErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmation) {
      return setError('Паролі не збігаються!');
    }

    try {
      if (token) {
        await authService.resetPassword(token, password, confirmation);
        setIsSuccess(true);
      }
    } catch (err) {
      const errorData = err as AxiosErrorResponse;
      setError(errorData.response?.data?.error || 'Токен застарів або невалідний');
    }
  };

  if (isSuccess) {
    return (
      <div className="page-container centered">
        <div className="auth-card text-center">
          <h2>Пароль змінено!</h2>
          <p>Тепер ви можете увійти в акаунт з новими даними.</p>
          <Link to="/" className="btn-primary full-width">Перейти до входу</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container centered">
      <div className="auth-card">
        <h2>Новий пароль</h2>

        {error && <div className="alert-danger">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Новий пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label>Підтвердження пароля</label>
            <input
              type="password"
              value={confirmation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmation(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary full-width">Змінити пароль</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
