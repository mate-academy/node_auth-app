import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRef } from 'react';

export const Activate = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('activationToken');
  const [status, setStatus] = useState(
    token ? 'Activating account...' : 'Activation token is missing.',
  );
  const { API_URL } = useAuth();
  const navigate = useNavigate();

  const effectRan = useRef(false);

  useEffect(() => {
    if (!token || effectRan.current === true) {
      return;
    }

    effectRan.current = true;

    fetch(`${API_URL}/activate?activationToken=${token}`).then(async (res) => {
      if (res.ok) {
        setStatus('Successfully activated! Redirecting to login...');
        setTimeout(() => navigate('/login'), 10000);
      } else {
        setStatus('Activation failed. The token is invalid or has expired.');
      }
    });
  }, [API_URL, navigate, token]);

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>{status}</h2>
    </div>
  );
};
