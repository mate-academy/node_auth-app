import { Link, useLocation } from 'react-router-dom';

export default function CheckEmailPage() {
  const { state } = useLocation();
  const email = state?.email;

  return (
    <section className="card">
      <h1>Check your email</h1>
      <p>
        We have sent an email to activate your account.
        {email ? (
          <>
            {' '}
            на <strong>{email}</strong>
          </>
        ) : null}
        . Follow the link in the email to complete your registration.
      </p>
      <p className="card__footer">
        Have you activated your account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
