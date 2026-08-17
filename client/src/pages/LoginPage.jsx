import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();

  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!form.password) {
      setError('Password is required.');
      return;
    }

    try {
      setLoading(true);

      await login(form);

      navigate('/profile', { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-5">
            <div className="box">
              <h1 className="title has-text-centered">Login</h1>

              {error && (
                <div className="notification is-danger is-light">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                />

                <Button type="submit" loading={loading}>
                  Login
                </Button>
              </form>

              <div className="has-text-centered mt-4">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <div className="has-text-centered mt-2">
                Don't have an account? <Link to="/register">Register</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
