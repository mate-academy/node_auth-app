import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <>
    <h1 className="title">Not Found 404</h1>
    <p>This page doesn't exist</p>
    <Link to="/">Go to home page</Link>
  </>
);
