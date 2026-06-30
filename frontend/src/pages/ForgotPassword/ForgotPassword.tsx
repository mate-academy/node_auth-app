import React, { useState } from 'react';
import { authService } from '../../services/auth.service';

interface AxiosErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await authService.forgotPassword(email);
      setIsSent(true);
    } catch (err: unknown) {
      const errorData = err as AxiosErrorResponse;
      setError(errorData.response?.data?.error || 'Користувача не знайдено');
    }
  };

  if (isSent) {
    return (
      <div className="page-container centered">
        <div className="auth-card text-center">
          <h2>Лист надіслано!</h2>
          <p>Ми відправили інструкції для відновлення пароля на <b>{email}</b>.</p>
          <a href="/" className="btn-secondary">Повернутись на головну</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container centered">
      <div className="auth-card">
        <h2>Відновлення пароля</h2>
        <p className="card-subtitle">Введіть ваш email для отримання лінка.</p>

        {error && <div className="alert-danger">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Електронна пошта</label>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>
          <button type="submit" className="btn-primary full-width">Надіслати лінк</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
