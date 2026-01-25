import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Invalid activation link');
      return;
    }

    async function activate() {
      try {
        const res = await api.get(`/auth/activate?token=${token}`);

        login(res.data.token);

        navigate('/profile');
      } catch (err) {
        setError(
          err.response?.data?.message || 'Error activating account',
        );
      }
    }

    activate();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return <p>Activating your account...</p>;
}
