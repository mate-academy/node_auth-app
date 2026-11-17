import { Link } from 'react-router-dom';

export const ForgotPasswordSent = () => {
  return (
    <>
      <h1 className="title">Password reset</h1>

      <p className="notification is-success is-light">
        If an account with this email exists, a password reset link
        has been sent.
        Please check your inbox.
      </p>

      <p>
        Remember your password? <Link to="/login">Log in</Link>
      </p>
    </>
  );
};
