import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user, setUser, logout, authFetch } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [nameError, setNameError] = useState('');

  const [pwdData, setPwdData] = useState({
    oldPassword: '',
    newPassword: '',
    confirm: '',
  });
  const [pwdError, setPwdError] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');

  const [emailData, setEmailData] = useState({
    password: '',
    newEmail: '',
    confirmNewEmail: '',
  });
  const [emailError, setEmailError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const updateName = async (event) => {
    event.preventDefault();
    setNameError('');

    const res = await authFetch('/profile/update-name', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser({ ...user, name: data.name });
    } else {
      setNameError(data.errors?.name || data.message || 'Update failed');
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    setPwdError('');
    setPwdMessage('');

    if (pwdData.newPassword !== pwdData.confirm) {
      setPwdError('Passwords do not match.');
      return;
    }

    const res = await authFetch('/profile/update-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldPassword: pwdData.oldPassword,
        newPassword: pwdData.newPassword,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setPwdMessage('Password updated successfully.');
      setPwdData({ oldPassword: '', newPassword: '', confirm: '' });
    } else {
      setPwdError(
        data.errors?.oldPassword || data.errors?.newPassword || data.message,
      );
    }
  };

  const updateEmail = async (event) => {
    event.preventDefault();
    setEmailError('');
    setEmailMessage('');

    if (emailData.newEmail !== emailData.confirmNewEmail) {
      setEmailError('Emails do not match.');
      return;
    }

    const res = await authFetch('/profile/update-email', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: emailData.password,
        newEmail: emailData.newEmail,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser({ ...user, email: data.email });
      setEmailMessage(
        'Email updated. A notification was sent to your old address.',
      );
      setEmailData({ password: '', newEmail: '', confirmNewEmail: '' });
    } else {
      setEmailError(
        data.errors?.password || data.errors?.newEmail || data.message,
      );
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-6-desktop is-8-tablet">
            <div className="box mb-5">
              <div className="level">
                <div className="level-left">
                  <div>
                    <h2 className="title is-4 mb-1">
                      User Profile: {user?.name}
                    </h2>
                    <p className="subtitle is-6 has-text-grey">
                      Email: {user?.email}
                    </p>
                  </div>
                </div>
                <div className="level-right">
                  <button
                    onClick={logout}
                    className="button is-danger is-light"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>

            <div className="box mb-5">
              <h3 className="title is-5 mb-4">Change Name</h3>
              <form onSubmit={updateName}>
                <div className="field has-addons">
                  <div className="control is-expanded">
                    <input
                      className="input"
                      type="text"
                      value={name}
                      required
                      onChange={(event) => setName(event.target.value)}
                    />
                  </div>
                  <div className="control">
                    <button type="submit" className="button is-primary">
                      Save
                    </button>
                  </div>
                </div>
                {nameError && <p className="help is-danger">{nameError}</p>}
              </form>
            </div>

            <div className="box mb-5">
              <h3 className="title is-5 mb-4">Change Password</h3>
              <form onSubmit={updatePassword}>
                <div className="field">
                  <label className="label">Old Password</label>
                  <div className="control">
                    <input
                      className="input"
                      type="password"
                      placeholder="Old Password"
                      required
                      value={pwdData.oldPassword}
                      onChange={(event) =>
                        setPwdData({
                          ...pwdData,
                          oldPassword: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">New Password</label>
                  <div className="control">
                    <input
                      className="input"
                      type="password"
                      placeholder="New Password"
                      required
                      value={pwdData.newPassword}
                      onChange={(event) =>
                        setPwdData({
                          ...pwdData,
                          newPassword: event.target.value,
                        })
                      }
                    />
                  </div>
                  <p className="help has-text-grey-dark">
                    ≥8 characters, 1 number, 1 uppercase letter.
                  </p>
                </div>

                <div className="field">
                  <label className="label">Confirm New Password</label>
                  <div className="control">
                    <input
                      className="input"
                      type="password"
                      placeholder="Confirm New Password"
                      required
                      value={pwdData.confirm}
                      onChange={(event) =>
                        setPwdData({ ...pwdData, confirm: event.target.value })
                      }
                    />
                  </div>
                </div>

                {pwdError && (
                  <div className="notification is-danger is-light py-2 px-3 my-3 is-size-7">
                    {pwdError}
                  </div>
                )}
                {pwdMessage && (
                  <div className="notification is-success is-light py-2 px-3 my-3 is-size-7">
                    {pwdMessage}
                  </div>
                )}

                <div className="field mt-4">
                  <div className="control">
                    <button
                      type="submit"
                      className="button is-link is-fullwidth"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="box">
              <h3 className="title is-5 mb-4">Change Email</h3>
              <form onSubmit={updateEmail}>
                <div className="field">
                  <label className="label">Password</label>
                  <div className="control">
                    <input
                      className="input"
                      type="password"
                      placeholder="Current password"
                      required
                      value={emailData.password}
                      onChange={(event) =>
                        setEmailData({
                          ...emailData,
                          password: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">New Email</label>
                  <div className="control">
                    <input
                      className="input"
                      type="email"
                      placeholder="new@example.com"
                      required
                      value={emailData.newEmail}
                      onChange={(event) =>
                        setEmailData({
                          ...emailData,
                          newEmail: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Confirm New Email</label>
                  <div className="control">
                    <input
                      className="input"
                      type="email"
                      placeholder="new@example.com"
                      required
                      value={emailData.confirmNewEmail}
                      onChange={(event) =>
                        setEmailData({
                          ...emailData,
                          confirmNewEmail: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <p className="help has-text-grey-dark">
                  Your old email address will be notified about this change.
                </p>

                {emailError && (
                  <div className="notification is-danger is-light py-2 px-3 my-3 is-size-7">
                    {emailError}
                  </div>
                )}
                {emailMessage && (
                  <div className="notification is-success is-light py-2 px-3 my-3 is-size-7">
                    {emailMessage}
                  </div>
                )}

                <div className="field mt-4">
                  <div className="control">
                    <button
                      type="submit"
                      className="button is-warning is-fullwidth"
                    >
                      Update Email
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
