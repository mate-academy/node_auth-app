import { Link } from 'react-router-dom';

export const ResetSuccess = () => {
  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '60px auto',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2 style={{ color: '#28a745' }}>Password Changed!</h2>
      <p style={{ color: '#555' }}>
        Your password has been successfully updated. You can now log in using
        your new credentials.
      </p>
      <div style={{ marginTop: '20px' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#007bff',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};
