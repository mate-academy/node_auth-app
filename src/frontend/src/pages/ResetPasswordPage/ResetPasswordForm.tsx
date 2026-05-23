import { useState } from 'react';
import { resetPassword } from '../../api/auth';

export const ResetPasswordForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [registered, setRegistered] = useState(false);

  const handleReset = async () => {
    await resetPassword(email);
    setRegistered(true);
  };

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    await handleReset();
  };

  if (registered) {
    return (
      <section className="registered">
        <h2>Check your email</h2>
        <p>If account exists, email was sent</p>
      </section>
    );
  }

  return (
    <div className="form-wrapper background-white">
      <h2>Reset password</h2>
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="input-container">
          <label htmlFor="email">
            <strong>Email</strong>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`form-input`}
            placeholder="Enter your email"
          />
        </div>
        <button type="submit" className="form-button">
          Submit
        </button>
      </form>
    </div>
  );
};
