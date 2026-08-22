import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <section className="section is-large">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-6-desktop is-8-tablet has-text-centered">
            <h1
              className="title is-1 has-text-danger mb-2"
              style={{ fontSize: '6rem' }}
            >
              404
            </h1>

            <h2 className="subtitle is-3 mb-4">Page Not Found</h2>

            <p className="has-text-grey is-size-5 mb-5">
              The page you are looking for does not exist or has been moved.
            </p>

            <div className="mt-5">
              <Link to="/login" className="button is-link is-medium is-rounded">
                Return to Home Screen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
