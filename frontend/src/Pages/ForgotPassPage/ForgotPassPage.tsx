import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';
import './ForgotPassPage.scss';

export const ForgotPassPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-pass-page">
      <div className="forgot-pass-card">
        <div className="forgot-pass-card__header">
          <div className="forgot-pass-card__icon-wrapper">
            <KeyRound size={32} />
          </div>
          <h1 className="forgot-pass-card__title">Forgot password?</h1>
          <p className="forgot-pass-card__description">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {error && (
          <div className="forgot-pass-message forgot-pass-message--error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="forgot-pass-success">
            <div className="forgot-pass-message forgot-pass-message--success">
              <CheckCircle size={18} />
              <span>Email sent! Check your inbox.</span>
            </div>
            <p className="forgot-pass-success__text">
              We have sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login" className="forgot-pass-btn forgot-pass-btn--primary">
              Back to Login
            </Link>
          </div>
        ) : (
          <form className="forgot-pass-form" onSubmit={handleSubmit}>
            <div className="forgot-pass-form__group">
              <label htmlFor="email" className="forgot-pass-form__label">Email</label>
              <div className="forgot-pass-form__input-wrapper">
                <Mail className="forgot-pass-form__input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  className="forgot-pass-form__input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="forgot-pass-btn forgot-pass-btn--primary"
              disabled={loading}
            >
              {loading ? <Loader2 className="spin" size={20} /> : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="forgot-pass-card__footer">
          <Link to="/login" className="forgot-pass-card__back-link">
            <ArrowLeft size={16} />
            <span>Back to log in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};