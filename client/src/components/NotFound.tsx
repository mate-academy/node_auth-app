import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <section className="section">
      <div className="container has-text-centered">
        <h1 className="title is-1 has-text-primary">404</h1>

        <h2 className="title is-3">
          Page not found
        </h2>

        <p className="subtitle is-5">
          Sorry, the page you are looking for does not exist.
        </p>

        <Link to="/" className="button is-primary">
          Go to home
        </Link>
      </div>
    </section>
  );
};
