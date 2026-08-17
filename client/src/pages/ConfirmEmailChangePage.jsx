import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { confirmEmailChange } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const ConfirmEmailChangePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { fetchMe, isAuthenticated } = useAuth();

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const hasRequestedConfirmation = useRef(false);

  useEffect(() => {
    if (hasRequestedConfirmation.current) {
      return;
    }

    hasRequestedConfirmation.current = true;

    const confirm = async () => {
      try {
        const data = await confirmEmailChange(token);

        setStatus('success');
        setMessage(data.notification || data.message);

        if (isAuthenticated) {
          try {
            await fetchMe();
            navigate('/profile', { replace: true });
          } catch {
            navigate('/login', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.message);
      }
    };

    confirm();
  }, [token, navigate, isAuthenticated, fetchMe]);

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-6">
            <div className="box has-text-centered">
              {status === 'loading' && (
                <>
                  <h1 className="title">Processing...</h1>
                  <button className="button is-loading is-primary">
                    Loading
                  </button>
                </>
              )}

              {status === 'success' && (
                <>
                  <h1 className="title has-text-success">Email confirmed!</h1>
                  <p className="mb-5">{message}</p>
                  <button className="button is-loading is-primary">
                    Redirecting...
                  </button>
                </>
              )}

              {status === 'error' && (
                <>
                  <h1 className="title has-text-danger">Confirmation failed</h1>
                  <p className="mb-5">{message}</p>
                  <button
                    className="button is-primary"
                    onClick={() => navigate('/profile')}
                  >
                    Go to profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConfirmEmailChangePage;
