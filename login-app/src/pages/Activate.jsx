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
  const { API_URL, login } = useAuth();
  const navigate = useNavigate();

  const effectRan = useRef(false);

  const getStatusStyle = () => {
    if (!token || status.includes('failed')) {
      return 'is-danger';
    }

    if (status.includes('Successfully')) {
      return 'is-success';
    }
    return 'is-link';
  };

  useEffect(() => {
    if (!token || effectRan.current === true) {
      return;
    }

    effectRan.current = true;

    fetch(`${API_URL}/activate?activationToken=${token}`, {
      credentials: 'include',
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();

        login(data.accessToken);
        setStatus('Successfully activated! Redirecting to your profile...');
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        setStatus('Activation failed. The token is invalid or has expired.');
      }
    });
  }, [API_URL, login, navigate, token]);

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-5-desktop is-7-tablet">
            <div className="box has-text-centered p-5">
              <h2
                className={`title is-4 has-text-${getStatusStyle().replace('is-', '')} mb-4`}
              >
                {status}
              </h2>

              {token && status.includes('Activating') && (
                <progress className="progress is-small is-link my-4" max="100">
                  Loading
                </progress>
              )}

              {status.includes('Successfully') && (
                <p className="has-text-grey is-size-6 mt-2">
                  You will be automatically redirected in a few seconds...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
