import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [newName, setNewName] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        navigate('/login');

        return;
      }

      try {
        const response = await fetch('http://localhost:3000/profile', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem('accessToken');
          navigate('/login');

          return;
        }

        setUser(data);
        setNewName(data.name);
      } catch {
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleNameChange = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(
        'http://localhost:3000/profile/name',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: newName,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to update name');

        return;
      }

      setUser(data.user);
      setMessage(data.message);
    } catch {
      setError('Something went wrong');
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(
        'http://localhost:3000/profile/password',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
            confirmation,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.errors
          ? data.errors.join(', ')
          : data.message;

        setError(errorMessage || 'Failed to update password');

        return;
      }

      setMessage(data.message);

      setOldPassword('');
      setNewPassword('');
      setConfirmation('');
    } catch {
      setError('Something went wrong');
    }
  };

  const handleEmailChange = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(
        'http://localhost:3000/profile/email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            email: newEmail,
            password: emailPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || 'Failed to request email change',
        );

        return;
      }

      setMessage(data.message);
      setNewEmail('');
      setEmailPassword('');
    } catch {
      setError('Something went wrong');
    }
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      await fetch('http://localhost:3000/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } finally {
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="auth-eyebrow">
            auth.system / profile
          </p>

          <h1 className="auth-title">
            Loading...
          </h1>

          <div className="auth-message">
            Fetching account data...
          </div>
        </section>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <div>
            <p className="auth-eyebrow">
              auth.system / profile
            </p>

            <h1 className="profile-title">
              {user.name}
            </h1>

            <p className="profile-email">
              {user.email}
            </p>
          </div>

          <button
            className="profile-logout"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        {(error || message) && (
          <div
            className={
              error
                ? 'profile-message profile-message--error'
                : 'profile-message profile-message--success'
            }
          >
            {error || message}
          </div>
        )}

        <div className="profile-grid">
          <section className="profile-card">
            <p className="auth-eyebrow">
              account / 01
            </p>

            <h2 className="profile-card__title">
              Change name
            </h2>

            <form
              className="profile-form"
              onSubmit={handleNameChange}
            >
              <div className="profile-field">
                <label
                  className="profile-label"
                  htmlFor="name"
                >
                  Name
                </label>

                <input
                  className="profile-input"
                  id="name"
                  type="text"
                  value={newName}
                  onChange={(event) =>
                    setNewName(event.target.value)
                  }
                />
              </div>

              <button
                className="profile-button"
                type="submit"
              >
                Save name
              </button>
            </form>
          </section>

          <section className="profile-card">
            <p className="auth-eyebrow">
              security / 02
            </p>

            <h2 className="profile-card__title">
              Change password
            </h2>

            <form
              className="profile-form"
              onSubmit={handlePasswordChange}
            >
              <div className="profile-field">
                <label
                  className="profile-label"
                  htmlFor="oldPassword"
                >
                  Current password
                </label>

                <input
                  className="profile-input"
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(event) =>
                    setOldPassword(event.target.value)
                  }
                />
              </div>

              <div className="profile-field">
                <label
                  className="profile-label"
                  htmlFor="newPassword"
                >
                  New password
                </label>

                <input
                  className="profile-input"
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                />
              </div>

              <div className="profile-field">
                <label
                  className="profile-label"
                  htmlFor="confirmation"
                >
                  Confirm new password
                </label>

                <input
                  className="profile-input"
                  id="confirmation"
                  type="password"
                  value={confirmation}
                  onChange={(event) =>
                    setConfirmation(event.target.value)
                  }
                />
              </div>

              <div>
                <p className="profile-label">
                  Password requirements
                </p>

                <ul className="auth-rules">
                  <li>At least 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number</li>
                </ul>
              </div>

              <button
                className="profile-button"
                type="submit"
              >
                Change password
              </button>
            </form>
          </section>

          <section className="profile-card profile-card--wide">
            <p className="auth-eyebrow">
              account / 03
            </p>

            <h2 className="profile-card__title">
              Change email
            </h2>

            <p className="profile-email">
              Current email: {user.email}
            </p>

            <p className="auth-description">
              A confirmation link will be sent to your new
              email address. Your current email will remain
              active until the change is confirmed.
            </p>

            <form
              className="profile-form"
              onSubmit={handleEmailChange}
            >
              <div className="profile-field">
                <label
                  className="profile-label"
                  htmlFor="newEmail"
                >
                  New email
                </label>

                <input
                  className="profile-input"
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(event) =>
                    setNewEmail(event.target.value)
                  }
                />
              </div>

              <div className="profile-field">
                <label
                  className="profile-label"
                  htmlFor="emailPassword"
                >
                  Current password
                </label>

                <input
                  className="profile-input"
                  id="emailPassword"
                  type="password"
                  value={emailPassword}
                  onChange={(event) =>
                    setEmailPassword(event.target.value)
                  }
                />
              </div>

              <button
                className="profile-button"
                type="submit"
              >
                Change email
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};
