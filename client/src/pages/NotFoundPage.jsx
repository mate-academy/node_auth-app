import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  const accessToken = localStorage.getItem('accessToken');

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-card__header">
          <p className="auth-eyebrow">
            auth.system / error
          </p>

          <h1 className="auth-title">
            404
          </h1>

          <p className="auth-description">
            The requested page could not be found.
          </p>
        </header>

        <div className="auth-message">
          &gt; error: route_not_found
        </div>

        <div className="auth-links">
          <Link
            className="auth-link"
            to={accessToken ? '/profile' : '/login'}
          >
            {accessToken ? 'Back to profile' : 'Back to login'}
          </Link>
        </div>
      </section>
    </main>
  );
};
