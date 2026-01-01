import { Link } from 'react-router-dom';
import './NotFoundPage.scss';
import { CircleAlert } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="not-found">
      <div className="not-found__container">
        <div className="not-found__icon">
          <CircleAlert />
        </div>
        <h1 className="not-found__code">404</h1>
        <h2 className="not-found__title">Page not found</h2>
        <p className="not-found__description">
          Unfortunately, the page you requested does not exist or has been removed.
        </p>
        <Link to="/profile/details" className="not-found__button">
          Back to main
        </Link>
      </div>
    </div>
  );
};