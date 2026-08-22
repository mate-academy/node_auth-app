import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { API_URL } = useAuth();
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setMessage('If this email exists, a password reset link has been sent.');
    } else {
      const data = await res.json();
      setError(data.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-4-desktop is-6-tablet">
            <div className="box">
              <h2 className="title is-4 has-text-centered">Reset Password</h2>

              <p className="has-text-grey is-size-6 mb-4">
                Enter your email address and we will send you instructions to
                reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Email Address</label>
                  <div className="control">
                    <input
                      className="input"
                      type="email"
                      placeholder="e.g. alex@example.com"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                {message && (
                  <div className="notification is-success is-light py-2 px-3 my-3 is-size-7">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="notification is-danger is-light py-2 px-3 my-3 is-size-7">
                    {error}
                  </div>
                )}

                <div className="field mt-5">
                  <div className="control">
                    <button
                      type="submit"
                      className="button is-link is-fullwidth"
                    >
                      Send Instructions
                    </button>
                  </div>
                </div>
              </form>

              <hr />

              <div className="has-text-centered is-size-7">
                <Link to="/login" className="has-text-link">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
