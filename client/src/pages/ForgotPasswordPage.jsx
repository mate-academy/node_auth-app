import { useState } from 'react';
import { Link } from 'react-router-dom';

import Input from '../components/Input';
import Button from '../components/Button';
import { forgotPassword } from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    try {
      setLoading(true);

      await forgotPassword(email);

      setSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-6">
              <div className="box has-text-centered">
                <h1 className="title">Check your email</h1>

                <p className="mb-5">
                  If an account with this email exists, we sent you a password
                  reset link.
                </p>

                <Link to="/login" className="button is-primary">
                  Back to login
                </Link>
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
          <div className="column is-5">
            <div className="box">
              <h1 className="title">Forgot password?</h1>

              <p className="mb-5">
                Enter your email and we'll send you a password reset link.
              </p>

              {error && (
                <div className="notification is-danger is-light">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />

                <Button type="submit" loading={loading}>
                  Send reset link
                </Button>
              </form>

              <p className="has-text-centered mt-4">
                <Link to="/login">Back to login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordPage;
