import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="status-page">
      <p className="status-page__eyebrow">404</p>
      <h1 className="status-page__title">Page not found</h1>
      <p className="status-page__text">
        The page you requested does not exist or may have been moved.
      </p>
      <Link className="app-button" to="/login">
        Go to login
      </Link>
    </main>
  );
}
