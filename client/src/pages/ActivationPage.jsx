import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ActivationPage() {
  const { activationToken } = useParams();
  const { activate, isLoading } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);

  const requested = useRef(false);

  useEffect(() => {
    if (isLoading || requested.current) return;
    requested.current = true;

    activate(activationToken)
      .then(() => navigate('/profile', { replace: true }))
      .catch((err) => {
        setMessage(
          err.status === 404
            ? 'This link is invalid or has already been used.'
            : err.message
        );
        setFailed(true);
      });
  }, [activationToken, activate, isLoading, navigate]);

  if (!failed) {
    return (
      <section className="card">
        <h1>Account activation</h1>
        <p>Checking the link...</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h1>The link is not active.</h1>
      <p>{message}</p>
      <p className="card__footer">
        Try <Link to="/register">register</Link> again or{' '}
        <Link to="/login">log in</Link> if your account is already active.
      </p>
    </section>
  );
}
