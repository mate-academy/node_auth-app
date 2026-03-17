import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <div className="links" style={{ marginTop: 20 }}>
        <Link to="/">Go home</Link>
      </div>
    </div>
  );
}
