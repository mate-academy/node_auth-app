import { Link, useLocation } from 'react-router-dom';

export default function ResetEmailSentPage() {
  const { state } = useLocation();

  return (
    <section className="card">
      <h1>Check your email</h1>
      <p>
        If an account exists
        {state?.email ? <> for <strong>{state.email}</strong></> : null}, we
        have sent a link to reset the password.
      </p>
      <p className="card__footer">
        <Link to="/login">Back to login</Link>
      </p>
    </section>
  );
}
