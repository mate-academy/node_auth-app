import cn from 'classnames';
import { AuthContext } from '../components/AuthContext.jsx';
import { useContext, useEffect, useState } from 'react';
import { PasswordForm } from '../components/PasswordForm.jsx';
import { NameForm } from '../components/NameForm.jsx';
import { EmailForm } from '../components/EmailForm.jsx';

export const ProfilePage = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [change, setChange] = useState('');
  const { user } = useContext(AuthContext);

  const { userName, email, id } = user || {};

  useEffect(() => {
    if (successMessage === '') {
      return;
    }

    const timeoutId = setTimeout(() => setSuccessMessage(''), 3000);

    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  const onSuccess = message => {
    setSuccessMessage(message);
    setChange('');
  };

  return (
    <section className="box">
      <h2 className="title">My Profile</h2>

      <div className="field">
        <p className="label">Name</p>
        <p className="control">
          <span className="input is-static">{userName}</span>
        </p>
        <button
          className="button is-small is-link mt-2"
          onClick={() => setChange('name')}
        >
          Change Name
        </button>
      </div>

      <div className="field">
        <p className="label">Email</p>
        <p className="control">
          <span className="input is-static">{email}</span>
        </p>
        <button
          className="button is-small is-link mt-2"
          onClick={() => setChange('email')}
        >
          Change Email
        </button>
      </div>

      <div className="field">
        <p className="label">Password</p>
        <p className="control">
          <span className="input is-static">*******</span>
        </p>
        <button
          className="button is-small is-link mt-2"
          onClick={() => setChange('password')}
        >
          Change Password
        </button>
      </div>

      <hr />

      {successMessage && (
        <div className="notification is-success">{successMessage}</div>
      )}

      {change === 'password' && <PasswordForm onSuccess={onSuccess} />}
      {change === 'name' && <NameForm id={id} onSuccess={onSuccess} />}
      {change === 'email' && <EmailForm id={id} onSuccess={onSuccess} />}
    </section>
  );
};
