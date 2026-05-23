import { useState } from 'react';
import type { ProfileUser } from '../../../types/User';
import type { ChangeEmailErrors } from '../../../types/FormErrors';
import { validateValues } from '../../../utils/validateValues';
import { changeEmail } from '../../../api/profile';

type Props = {
  user: ProfileUser;
};

export const ProfileChangeEmail: React.FC<Props> = ({ user }) => {
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ChangeEmailErrors>({
    newEmail: '',
    confirmEmail: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent) => {
    setFormError('');
    event.preventDefault();

    const newErrors: ChangeEmailErrors = {
      newEmail: validateValues.email(newEmail),
      confirmEmail: validateValues.email(confirmEmail),
      password: validateValues.password(password),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error);

    if (hasErrors) {
      return;
    }

    if (newEmail !== confirmEmail) {
      setFormError('Emails do not match!');

      return;
    }

    if (newEmail === user.email) {
      setFormError('New email cannot be the same as your current email.');

      return;
    }

    try {
      await changeEmail(newEmail, password);
      setDone(true);
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      }
    }
  };

  if (done) {
    return (
      <div className="profile-information-done">
        <h3 className="profile-change-email-title">
          Confirmation link sent! Please check your new email address to
          complete the change
        </h3>
      </div>
    );
  }
  return (
    <div className="profile-information">
      <h3>Change email</h3>
      <form className="form-container profile-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <label htmlFor="newEmail">
            <strong>New email</strong>
          </label>
          <input
            type="email"
            name="newEmail"
            className="form-input"
            placeholder="Enter new email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          {errors.newEmail && <p className="notification">{errors.newEmail}</p>}
        </div>
        <div className="input-container">
          <label htmlFor="confirmEmail">
            <strong>Confirm new email</strong>
          </label>
          <input
            type="email"
            name="confirmEmail"
            className="form-input"
            placeholder="Confirm new email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
          {errors.confirmEmail && (
            <p className="notification">{errors.confirmEmail}</p>
          )}
        </div>
        <div className="input-container">
          <label htmlFor="password">
            <strong>Your password</strong>
          </label>
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="notification">{errors.password}</p>}
        </div>
        {formError && <p className="notification">{formError}</p>}
        <button type="submit" className="form-button">
          Update email
        </button>
      </form>
    </div>
  );
};
