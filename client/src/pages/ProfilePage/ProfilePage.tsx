import { Navigate, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';

export const ProfilePage = () => {
  const { user, isChecking, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogOut = async () => {
   await authApi.logOut();
    setUser(null);
    navigate('/login');
  };

  if (isChecking) {
    return (
      <AuthCard title="Loading... 🛰️">
        <div className="has-text-centered">
          <span
            className="button is-loading is-ghost is-large"
            aria-label="Loading"
          />
        </div>
      </AuthCard>
    );
  }
  if (!user) {
    return <Navigate to={'/login'} replace />;
  }

  return (
    <AuthCard title="Welcome aboard 🚀">
      <div
        className="has-text-centered mb-4"
        style={{
          width: 72,
          height: 72,
          margin: '0 auto',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontSize: 32,
          fontWeight: 700,
          color: '#fff',
          background: 'linear-gradient(135deg, #4facfe, #a855f7)',
          boxShadow: '0 0 30px rgba(120, 140, 255, 0.5)',
        }}
      >
        {user.name.charAt(0).toUpperCase()}
      </div>

      <p className="has-text-centered is-size-4 has-text-weight-semibold has-text-link mb-1">
        {user.name}
      </p>

      <p className="has-text-centered has-text-grey-light mb-5">{user.email}</p>
      <button
        type="button"
        className="button is-small is-danger is-outlined"
        style={{ position: 'absolute', top: 5, right: 16 }}
        onClick={handleLogOut}
      >
        Log out
      </button>
    </AuthCard>
  );
};
