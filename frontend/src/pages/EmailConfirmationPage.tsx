import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meService } from '../services/meService';
import { Loader } from '../components/Loader';
import { useAuth } from '../components/AuthContext';
import { AxiosError } from 'axios';

export const EmailConfirmationPage = () => {
  const { emailToken } = useParams<{ emailToken: string }>();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!emailToken) {
      setErrorMessage('Confirmation token is missing.');
      setIsLoading(false);
      return;
    }

    meService
      .confirmEmailChange(emailToken)
      .then(async () => {
        setIsSuccess(true);
        setIsLoading(false);
        try {
          await logout();
        } catch (error) {
          error
        } 
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        const message =
          err.response?.data?.message ??
          'Email verification error or the token has expired.';
        setErrorMessage(message);
        setIsLoading(false);
      });
  }, [emailToken, logout]);
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, navigate]);

 const handleManualLogin = async () => {
  try {
    await logout();
  } finally {
    navigate('/login');
  }
};

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="container tab-content">
      <div className="box has-text-centered">
        {isSuccess ? (
          <>
            <h1 className="title has-text-success">Email successfully changed!</h1>
            <p className="notification is-success is-light">
             Your email address has been updated. Please log in with the new email.
            </p>
            <p className="is-size-6 mb-4">
              Automatic redirect to the login page in <strong>{countdown}</strong> sec...
            </p>
            <button onClick={() => void handleManualLogin()} className="button is-success">
  Log in now
</button>
          </>
        ) : (
          <>
            <h1 className="title has-text-danger">Confirmation error</h1>
            <p className="notification is-danger is-light">{errorMessage}</p>
            <button onClick={() => navigate('/profile')} className="button is-link">
             Return to profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};