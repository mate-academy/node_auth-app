import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, API_URL } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      login(data.accessToken);
      navigate('/profile');
    } else {
      setError(data.message || 'Invalid credentials');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-4-desktop is-6-tablet">
            <div className="box">
              <h2 className="title is-4 has-text-centered">Sign In</h2>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Email</label>
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

                <div className="field">
                  <label className="label">Password</label>
                  <div className="control">
                    <input
                      className="input"
                      type="password"
                      placeholder="********"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="notification is-danger is-light py-2 px-3 my-3">
                    {error}
                  </div>
                )}

                <div className="field mt-5">
                  <div className="control">
                    <button
                      type="submit"
                      className="button is-primary is-fullwidth"
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </form>

              <hr />

              <div className="is-flex is-justify-content-space-between text-is-size-7">
                <Link to="/register" className="has-text-link">
                  Register
                </Link>
                <Link to="/forgot-password" className="has-text-grey">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
