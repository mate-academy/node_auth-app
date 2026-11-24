import { Navigate, useParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useEffect, useRef, useState } from 'react';
import { AuthCard } from '../../components/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { accessTokenService } from '../../api/accessToken';

export const ActivatePage = () => {
  const { activationToken } = useParams();
  const [error, setError] = useState('');

  const { user, isChecking, setUser } = useAuth();

  const isRequested = useRef(false);

  useEffect(() => {
    if (!activationToken || isRequested.current) {
      return;
    }

    isRequested.current = true;

    const activateUser = async () => {
      try {
        const { data } = await authApi.activate(activationToken);
        accessTokenService.save(data.accessToken);
        setUser(data.user);
      } catch {
        setError('Activation link is invalid or has already been used');
      }
    };

    activateUser();
  }, [activationToken]);

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
  if (user) {
    return <Navigate to={'/profile'} replace />;
  }

  if (error) {
    return (
      <AuthCard title="Activation failed ☄️">
        <p className="has-text-centered has-text-danger">{error}</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Activating... 🛰️">
      <p className="has-text-centered has-text-grey-light">Please wait</p>
    </AuthCard>
  );
};
