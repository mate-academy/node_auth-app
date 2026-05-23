import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { confirmNewPassword } from '../../api/auth';
import type { NewPasswordErrors } from '../../types/FormErrors';
import { validateValues } from '../../utils/validateValues';
import type { ConfirmNewPasswordData } from '../../types/ConfirmNewPasswordData';
import { CircleCheck, Info } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

export const ResetPasswordPage: React.FC = () => {
  const { resetToken } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<NewPasswordErrors>({
    newPassword: '',
    confirmPassword: '',
  });
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    setError('');

    const newErrors: NewPasswordErrors = {
      newPassword: validateValues.password(newPassword),
      confirmPassword: validateValues.password(confirmPassword),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error);

    if (hasErrors) {
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (!resetToken) {
      return;
    }

    const data: ConfirmNewPasswordData = {
      resetToken,
      newPassword,
    };

    try {
      await confirmNewPassword(data);
      setDone(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  if (done) {
    return (
      <div className="reset-pass">
        <CircleCheck size={50} color="green" />
        <h2>Password successfully changed!</h2>
        <a href="/login" className="reset-pass-link">
          LOGIN
        </a>
      </div>
    );
  }

  return (
    <div className="form-wrapper background-white">
      <h2>Create a new password</h2>
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="input-container">
          <div className="password-icon-container">
            <label htmlFor="newPassword">
              <strong>Password</strong>
            </label>
            <a className="my-anchor-element">{<Info size={20} />}</a>
            <Tooltip anchorSelect=".my-anchor-element" place="top">
              Password must be at least 6 characters long
            </Tooltip>
          </div>
          <input
            type="password"
            name="newPassword"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`form-input`}
            placeholder="Set new password"
          />

          {errors.newPassword && (
            <p className="notification">{errors.newPassword}</p>
          )}
        </div>
        <div className="input-container">
          <div className="password-icon-container">
            <label htmlFor="confirmPassword">
              <strong>Password</strong>
            </label>
            <a className="my-anchor-element">{<Info size={20} />}</a>
            <Tooltip anchorSelect=".my-anchor-element" place="top">
              Password must be at least 6 characters long
            </Tooltip>
          </div>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`form-input`}
            placeholder="Confirm new password"
          />
          {errors.confirmPassword && (
            <p className="notification">{errors.confirmPassword}</p>
          )}
        </div>
        {error && <p className="notification">{error}</p>}
        <button type="submit" className="form-button">
          Confirm
        </button>
      </form>
    </div>
  );
};
