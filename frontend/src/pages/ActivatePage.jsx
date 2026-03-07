import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from '../components/ui/Loader';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

export const ActivatePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    authApi
      .activate(token)
      .then(({ data }) => {
        localStorage.setItem('accessToken', data.accessToken);
        setUser(data.user);
        navigate('/profile');
      })
      .catch(() => setError('Невірний або прострочений токен'));
  }, [token, navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return <Loader centered />;
};
