import { Link } from 'react-router-dom';

export default function ResetSuccessPage() {
  return (
    <section className="card">
      <h1>Password changed</h1>
      <p>Your password has been updated. You can now log in.</p>
      <Link to="/login" className="btn btn--primary">
        Log in
      </Link>
    </section>
  );
}
