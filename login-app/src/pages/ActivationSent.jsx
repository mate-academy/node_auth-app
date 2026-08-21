import { Link } from 'react-router-dom';

export const ActivationSent = () => {
  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '60px auto',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2>Check Your Email</h2>
      <p style={{ color: '#555', lineHeight: '1.5' }}>
        An activation link has been sent to your email address. Please check
        your inbox and click the link to confirm your account.
      </p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
};
