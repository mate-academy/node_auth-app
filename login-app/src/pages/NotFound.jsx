import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '80px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '72px', margin: '0', color: '#dc3545' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ color: '#666' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <div style={{ marginTop: '20px' }}>
        <Link
          to="/login"
          style={{
            color: '#007bff',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Return to Home Screen
        </Link>
      </div>
    </div>
  );
};
