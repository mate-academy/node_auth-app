import { Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

export const PasswordResetSentPage = () => {
  const { isChecked, currentUser } = useAuth();

  // already logged in users should not be here
  if (isChecked && currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="box has-text-centered">
      <h1 className="title">Check your email</h1>

      <p className="mb-4">
        We have sent you an email with a password reset link.
      </p>

      <p className="has-text-grey mb-5">
        If you don’t see the email, check your spam folder.
      </p>
    </div>
  );
};
