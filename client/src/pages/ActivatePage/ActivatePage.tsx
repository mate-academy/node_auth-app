import { useParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useEffect, useRef, useState } from 'react';
import { AuthCard } from '../../components/AuthCard';

export const ActivatePage = () => {
  const { activationToken } = useParams();
  const [error, setError] = useState('');
  const [isActivated, setIsActivated] = useState(false);

  const isRequested = useRef(false);

  useEffect(() => {
    if (!activationToken || isRequested.current) {
      return;
    }

    isRequested.current = true;

    const activateUser = async () => {
      try {
        await authApi.activate(activationToken);
        setIsActivated(true);
      } catch {
        setError('Activation link is invalid or has already been used');
      }
    };

    activateUser();
  }, [activationToken]);

  if (error) {
    return (
      <AuthCard title="Activation failed ☄️">
        <p className="has-text-centered has-text-danger">{error}</p>
      </AuthCard>
    );
  }

  if (isActivated) {
    return (
      <AuthCard title="Account activated! 🚀">
        <p className="has-text-centered has-text-success">
          Welcome to the galaxy
        </p>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Activating... 🛰️">
      <p className="has-text-centered has-text-grey-light">Please wait</p>
    </AuthCard>
  );
};
