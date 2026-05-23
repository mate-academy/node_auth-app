import { useState } from 'react';
import type { ProfileUser } from '../../../types/User';
import type { ChangePasswordErorrs } from '../../../types/FormErrors';
import { validateValues } from '../../../utils/validateValues';
import { changePassword } from '../../../api/profile';
import { CircleCheck } from 'lucide-react';

type Props = {
  user: ProfileUser;
};

export const ProfileChangePassword: React.FC<Props> = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<ChangePasswordErorrs>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent) => {
    setFormError('');
    event.preventDefault();

    const newErrors: ChangePasswordErorrs = {
      currentPassword: validateValues.password(currentPassword),
      newPassword: validateValues.password(newPassword),
      confirmPassword: validateValues.password(confirmPassword),
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error);

    if (hasErrors) {
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match!');

      return;
    }

    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
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
        <CircleCheck size={50} color="green" />
        <h3 className="profile-information-title">The password has been changed successfully.</h3>
      </div>
    );
  }

  return (
    <div className="profile-information">
      <h3>Change password</h3>
      <form className="form-container profile-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <label htmlFor="currentPassword">
            <strong>Current password</strong>
          </label>
          <input
            type="password"
            name="currentPassword"
            className="form-input"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          {errors.currentPassword && <p className="notification">{errors.currentPassword}</p>}
        </div>
        <div className="input-container">
          <label htmlFor="newPassword">
            <strong>New password</strong>
          </label>
          <input
            type="password"
            name="newPassword"
            className="form-input"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {errors.newPassword && <p className="notification">{errors.newPassword}</p>}
        </div>
        <div className="input-container">
          <label htmlFor="confirmPassword">
            <strong>Confirm new password</strong>
          </label>
          <input
            type="password"
            name="confirmPassword"
            className="form-input"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && <p className="notification">{errors.confirmPassword}</p>}
        </div>
        {formError && <p className="notification">{formError}</p>}
        <button type="submit" className="form-button">
          Update password
        </button>
      </form>
    </div>
  );
};
