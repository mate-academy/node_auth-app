'use strict';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api';

export default function Activate() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        await apiRequest(`/auth/activate/${token}`, { method: 'GET' });
        setStatus('ok');

        navigate('/', { replace: true });
      } catch (e) {
        setError(e.message || 'Activation failed');
        setStatus('error');
      }
    })();
  }, [token, navigate]);

  if (status === 'loading') return <div>Activating...</div>;

  if (status === 'error') {
    return (
      <div>
        <h1>Activation error</h1>
        <p style={{ color: 'crimson' }}>{error}</p>
        <Link to="/login">Go to login</Link>
      </div>
    );
  }

  return (
   <div>Activated. Redirecting...</div>
  );
}
