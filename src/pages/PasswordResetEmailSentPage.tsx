import { Link } from 'react-router-dom';

export const PasswordResetEmailSentPage = () => {
  return (
    <>
      <h1 className="title">Email sent</h1>

      <p className="notification is-success is-light">
        If this email exists, password reset link was sent.
      </p>

      <Link to="/login">Back to login</Link>
    </>
  );
};
