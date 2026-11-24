import { Navigate, useParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useEffect, useRef, useState } from 'react';
import { AuthCard } from '../../components/AuthCard';
import { useAuth } from '../../context/AuthContext';

export const ActivateEmailPage = () => {
  const { resetEmailToken } = useParams();
  const [error, setError] = useState('');

  const { user, isChecking, setUser } = useAuth();

  const isRequested = useRef(false);

  useEffect(() => {
    if (!resetEmailToken || isChecking || isRequested.current) {
      return;
    }

    isRequested.current = true;

    const confirmEmail = async () => {
      try {
        const { data } = await authApi.confirmEmail(resetEmailToken);
        if (user) {
          setUser(data);
        }
      } catch {
        setError('Activation link is invalid or has already been used');
      }
    };

    confirmEmail();
  }, [resetEmailToken, isChecking, user, setUser]);

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
