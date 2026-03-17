import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Activate() {
  const { token } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/auth/activate/${token}`, { method: 'POST', credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else {
          login(data.user);
          navigate('/profile');
        }
      });
  }, [token]);

  if (status === 'loading') return <div className="container"><p>Activating...</p></div>;

  return (
    <div className="container">
      <h1>Invalid link</h1>
      <div className="alert alert-error">{message}</div>
      <div className="links"><Link to="/register">Register</Link></div>
    </div>
  );
}
