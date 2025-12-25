import { Link } from "react-router-dom";

export const PasswordResetSuccessPage = () => {
  return (
    <div className="box">
      <h1 className="title">Password changed successfully</h1>
      <Link className="button is-success has-text-weight-bold" to="/login">
        Log in
      </Link>
    </div>
  );
};
