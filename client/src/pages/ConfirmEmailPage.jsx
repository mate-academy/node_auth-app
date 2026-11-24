import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { confirmEmailChange } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function ConfirmEmailPage() {
  const { token } = useParams();
  const { logout, isLoading } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  const requested = useRef(false);

  useEffect(() => {
    if (isLoading || requested.current) return;
    requested.current = true;

    confirmEmailChange(token)
      .then(async () => {
        await logout();
        setStatus('success');
      })
      .catch((err) => {
        setMessage(err.message);
        setStatus('error');
      });
  }, [token, isLoading, logout]);

  if (status === 'loading') {
    return (
      <section className="card">
        <h1>Email confirmation</h1>
        <p>Checking the link...</p>
      </section>
    );
  }

  if (status === 'success') {
    return (
      <section className="card">
        <h1>Email changed</h1>
        <p>Your email has been updated. Please log in with the new email.</p>
        <Link to="/login" className="btn btn--primary">
          Log in
        </Link>
      </section>
    );
  }

  return (
    <section className="card">
      <h1>The link is not active.</h1>
      <p>{message}</p>
      <p className="card__footer">
        <Link to="/login">Go to login</Link>
      </p>
    </section>
  );
}
