import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';
import './ResetPassPage.scss';

export const ResetPassPage = () => {
  const { resetToken } = useParams<{ resetToken: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  const isPasswordValid = Object.values(rules).every(Boolean);
  const isMatch = password === confirmPassword && password !== '';
  const canSubmit = isPasswordValid && isMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetToken) {
      setError('Invalid reset link');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword(resetToken, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-pass-page">
        <div className="reset-pass-card">
          <div className="reset-pass-success">
            <div className="reset-pass-message reset-pass-message--success">
              <CheckCircle size={20} />
              <span>Password reset successfully!</span>
            </div>
            <p className="reset-pass-card__description">
              You can now log in with your new password.
              Redirecting to login page...
            </p>
            <Link to="/login" className="reset-pass-success__link">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-pass-page">
      <div className="reset-pass-card">
        <div className="reset-pass-card__header">
          <div className="reset-pass-card__icon-wrapper">
            <KeyRound size={32} />
          </div>
          <h1 className="reset-pass-card__title">Set new password</h1>
          <p className="reset-pass-card__description">
            Your new password must be different to previously used passwords.
          </p>
        </div>

        {error && (
          <div className="reset-pass-message reset-pass-message--error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="reset-pass-form" onSubmit={handleSubmit}>
          <div className="reset-pass-form__group">
            <label className="reset-pass-form__label" htmlFor="password">
              New Password
            </label>
            <div className="reset-pass-form__input-wrapper">
              <Lock className="reset-pass-form__icon" size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="reset-pass-form__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="reset-pass-form__toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="reset-pass-form__group">
            <label className="reset-pass-form__label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="reset-pass-form__input-wrapper">
              <Lock className="reset-pass-form__icon" size={18} />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                className="reset-pass-form__input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="password-rules">
            <p className="password-rules__title">Password requirements:</p>
            <ul className="password-rules__list">
              <li className={`password-rules__item ${rules.length ? 'password-rules__item--valid' : ''}`}>
                <CheckCircle size={12} /> At least 8 characters
              </li>
              <li className={`password-rules__item ${rules.upper ? 'password-rules__item--valid' : ''}`}>
                <CheckCircle size={12} /> One capital letter
              </li>
              <li className={`password-rules__item ${rules.number ? 'password-rules__item--valid' : ''}`}>
                <CheckCircle size={12} /> One number
              </li>
              <li className={`password-rules__item ${rules.special ? 'password-rules__item--valid' : ''}`}>
                <CheckCircle size={12} /> One special character
              </li>
              <li className={`password-rules__item ${isMatch ? 'password-rules__item--valid' : ''}`}>
                <CheckCircle size={12} /> Passwords match
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="reset-pass-form__submit-btn"
            disabled={!canSubmit || loading}
          >
            {loading ? <Loader2 className="spin" size={20} /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};