import { Link, useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="hero is-fullheight is-light">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1
            className="title is-1 has-text-link"
            style={{ fontSize: '7rem', lineHeight: 1 }}
          >
            404
          </h1>

          <div className="mb-4">
            <span className="tag is-link is-light is-medium">
              Page not found
            </span>
          </div>

          <h2 className="subtitle is-3 mb-3">Oh! It looks like you're lost.</h2>
          <p
            className="has-text-grey mb-5"
            style={{ maxWidth: '440px', margin: '0 auto 1.5rem' }}
          >
            The page you are looking for does not exist, has been deleted, or
            has been moved to another address.
          </p>

          <div className="buttons is-centered">
            <button
              onClick={() => navigate(-1)}
              className="button is-light is-medium"
            >
              Back
            </button>

            <Link to="/" className="button is-link is-medium">
              Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
