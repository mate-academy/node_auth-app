import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { activate } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const ActivationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { startSession } = useAuth();

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const hasRequestedActivation = useRef(false);

  useEffect(() => {
    if (hasRequestedActivation.current) {
      return;
    }

    hasRequestedActivation.current = true;

    const activateAccount = async () => {
      try {
        const data = await activate(token);
        await startSession(data);

        setStatus('success');
        setMessage(data.message);
        navigate('/profile', { replace: true });
      } catch (error) {
        setStatus('error');
        setMessage(error.message);
      }
    };

    activateAccount();
  }, [token, navigate, startSession]);

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-6">
            <div className="box has-text-centered">
              {status === 'loading' && (
                <>
                  <h1 className="title">Activating account...</h1>

                  <button className="button is-loading is-primary">
                    Loading
                  </button>
                </>
              )}

              {status === 'success' && (
                <>
                  <h1 className="title has-text-success">Account activated!</h1>

                  <p className="mb-5">{message}</p>

                  <button className="button is-loading is-primary">
                    Redirecting to profile...
                  </button>
                </>
              )}

              {status === 'error' && (
                <>
                  <h1 className="title has-text-danger">Activation failed</h1>

                  <p className="mb-5">{message}</p>

                  <button
                    className="button is-primary"
                    onClick={() => navigate('/login')}
                  >
                    Go to login
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

export default ActivationPage;
