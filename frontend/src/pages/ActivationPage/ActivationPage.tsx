import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

interface AxiosErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const ActivationPage = () => {
  const { email, token } = useParams<{ email: string; token: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const activateAccount = async () => {
      if (!email || !token) {
        setStatus('error');
        setErrorMessage('Відсутні дані для активації');
        return;
      }

      try {
        await authService.activation(email, token);
        setStatus('success');

        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } catch (err: unknown) {
        const errorData = err as AxiosErrorResponse;
        setStatus('error');
        setErrorMessage(errorData.response?.data?.error || 'Помилка під час активації');
      }
    };

    activateAccount();
  }, [email, token, navigate]);

  return (
    <div className="page-container centered">
      <div className="auth-card text-center">
        {status === 'loading' && <h2>Активація акаунта...</h2>}

        {status === 'success' && (
          <>
            <h2 className="text-success">Акаунт успішно активовано!</h2>
            <p>Зараз ви будете перенаправлені на сторінку профілю...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-danger">Помилка активації</h2>
            <p>{errorMessage}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Повернутися на головну
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivationPage;
