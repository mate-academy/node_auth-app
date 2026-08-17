import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <section className="hero is-fullheight">
      <div className="hero-body">
        <div className="container has-text-centered">
          <p className="title is-1">404</p>

          <p className="subtitle">Page not found</p>

          <Link to="/" className="button is-primary">
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
