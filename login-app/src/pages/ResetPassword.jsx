import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { API_URL } = useAuth();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const validatePassword = (pwd) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!validatePassword(password)) {
      setError(
        'Password must be at least 8 characters long, include one uppercase letter, and one number.',
      );
      return;
    }

    const res = await fetch(`${API_URL}/reset-password-save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      navigate('/reset-success');
    } else {
      const data = await res.json();
      setError(
        data.message || 'Failed to reset password. The link may have expired.',
      );
    }
  };

  if (!token) {
    return (
      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-5-desktop is-7-tablet">
              <div className="notification is-warning is-light has-text-centered">
                <h2 className="subtitle is-5 font-weight-bold">
                  Invalid or missing reset token.
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-4-desktop is-6-tablet">
            <div className="box">
              <h2 className="title is-4 has-text-centered">
                Create New Password
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">New Password</label>
                  <div className="control">
                    <input
                      className="input"
                      type="password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="********"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Confirm New Password</label>
                  <div className="control">
                    <input
                      className="input"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="********"
                    />
                  </div>
                </div>

                {error && (
                  <div className="notification is-danger is-light py-2 px-3 my-3 is-size-7">
                    {error}
                  </div>
                )}

                <div className="field mt-5">
                  <div className="control">
                    <button
                      type="submit"
                      className="button is-success is-fullwidth"
                    >
                      Save New Password
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
