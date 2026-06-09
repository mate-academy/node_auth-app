import { Link } from 'react-router-dom';

export const ResetPasswordSuccessPage = () => {
  return (
    <>
      <h1 className="title">Password changed</h1>

      <p className="notification is-success is-light">
        Your password was changed successfully.
      </p>

      <Link to="/login">Go to login</Link>
    </>
  );
};
