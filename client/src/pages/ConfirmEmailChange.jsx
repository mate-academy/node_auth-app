import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function ConfirmEmailChange() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/profile/confirm-email-change/${token}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else {
          setStatus('success');
          setMessage(data.message);
        }
      });
  }, [token]);

  if (status === 'loading') return <div className="container"><p>Confirming...</p></div>;

  return (
    <div className="container">
      <div className={`alert alert-${status === 'success' ? 'success' : 'error'}`}>{message}</div>
      <div className="links" style={{ marginTop: 16 }}>
        <Link to="/profile">Go to profile</Link>
      </div>
    </div>
  );
}
