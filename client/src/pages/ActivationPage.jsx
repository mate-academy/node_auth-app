import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ActivationPage() {
  const { activationToken } = useParams();
  const { activate, isLoading } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  const requested = useRef(false);

  useEffect(() => {
    if (isLoading || requested.current) return;
    requested.current = true;

    activate(activationToken)
      .then(() => setStatus('success'))
      .catch((err) => {
        setMessage(err.message);
        setStatus('error');
      });
  }, [activationToken, activate, isLoading]);

  if (status === 'loading') {
    return (
      <section className="card">
        <h1>Account activation</h1>
        <p>Checking the link...</p>
      </section>
    );
  }

  if (status === 'success') {
    return (
      <section className="card">
        <h1>Account activated</h1>
        <p>Your email has been verified and you are now logged in.</p>
        <Link to="/profile" className="btn btn--primary">
          Continue
        </Link>
      </section>
    );
  }

  return (
    <section className="card">
      <h1>The link is not active.</h1>
      <p>{message || 'This link is invalid or has already been used.'}</p>
      <p className="card__footer">
        Try <Link to="/register">register</Link> again or{' '}
        <Link to="/login">log in</Link> if your account is already active.
      </p>
    </section>
  );
}
