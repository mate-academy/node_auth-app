import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Input from '../components/Input';
import Button from '../components/Button';
import PasswordRules from '../components/PasswordRules';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
  const { token } = useParams();

  const [form, setForm] = useState({
    password: '',
    confirmation: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (form.password !== form.confirmation) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      await resetPassword(token, form);

      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-6">
              <div className="box has-text-centered">
                <h1 className="title has-text-success">Password changed!</h1>

                <p className="mb-5">
                  Your password has been successfully changed.
                </p>

                <Link to="/login" className="button is-primary">
                  Go to login
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
              <h1 className="title">Reset password</h1>

              {error && (
                <div className="notification is-danger is-light">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <Input
                  label="New password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                />

                <PasswordRules password={form.password} />

                <Input
                  label="Confirm password"
                  name="confirmation"
                  type="password"
                  value={form.confirmation}
                  onChange={handleChange}
                />

                <Button type="submit" loading={loading}>
                  Reset password
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
