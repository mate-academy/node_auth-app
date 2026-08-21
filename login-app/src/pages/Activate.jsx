import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Activate = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(
    token ? 'Activating account...' : 'Activation token is missing.',
  );
  const { login, API_URL } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      return;
    }

    fetch(`${API_URL}/activate?token=${token}`).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setStatus('Successfully activated! Redirecting...');
        login(data.token);
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        setStatus('Activation failed. The token is invalid.');
      }
    });
  }, [API_URL, login, navigate, token]);

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>{status}</h2>
    </div>
  );
};
