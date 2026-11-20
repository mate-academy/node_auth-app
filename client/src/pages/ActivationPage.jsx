import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { activateUser } from '../api/auth';

export default function ActivationPage() {
  const { activationToken } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  // У StrictMode (dev) ефект викликається двічі, а токен одноразовий —
  // другий запит повернув би помилку, тому захищаємося від дубля
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    activateUser(activationToken)
      .then(() => setStatus('success'))
      .catch((err) => {
        setMessage(err.message);
        setStatus('error');
      });
  }, [activationToken]);

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
        <p>Your email has been verified. You can now log in to your account.</p>
        <Link to="/login" className="btn btn--primary">
          Log in
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
