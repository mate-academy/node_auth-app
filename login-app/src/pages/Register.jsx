import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { API_URL } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validatePassword(formData.password)) {
      setError(
        'Password must be at least 8 characters long, including a number and an uppercase letter.',
      );
      return;
    }

    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) navigate('/activation-sent');
    else {
      const data = await res.json();
      setError(data.message || 'Registration failed');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-4-desktop is-6-tablet">
            <div className="box">
              <h2 className="title is-4 has-text-centered">Registration</h2>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Name</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. Alex Smith"
                      required
                      onChange={(event) =>
                        setFormData({ ...formData, name: event.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Email</label>
                  <div className="control">
                    <input
                      className="input"
                      type="email"
                      placeholder="e.g. alex@example.com"
                      required
                      onChange={(event) =>
                        setFormData({ ...formData, email: event.target.value })
                      }
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
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          password: event.target.value,
                        })
                      }
                    />
                  </div>
                  <p className="help has-text-grey-dark mt-1">
                    Password requirements: ≥8 characters, 1 number, 1 uppercase
                    letter.
                  </p>
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
                      Register
                    </button>
                  </div>
                </div>
              </form>

              <hr />

              <div className="has-text-centered is-size-7">
                <Link to="/login" className="has-text-link">
                  Already have an account? Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
