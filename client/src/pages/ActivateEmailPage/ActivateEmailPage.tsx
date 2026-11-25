import { Link, Navigate, useParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useEffect, useRef, useState } from 'react';
import { AuthCard } from '../../components/AuthCard';
import { useAuth } from '../../context/AuthContext';

export const ActivateEmailPage = () => {
  const { resetEmailToken } = useParams();
  const [error, setError] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

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
        setIsConfirmed(true);
      } catch {
        setError('Confirmation link is invalid or has already been used');
      }
    };

    confirmEmail();
  }, [resetEmailToken, isChecking, user, setUser]);

  if (error) {
    return (
      <AuthCard title="Confirmation failed ☄️">
        <p className="has-text-centered has-text-danger">{error}</p>
      </AuthCard>
    );
  }

  if (isConfirmed) {
    if (user) {
      return <Navigate to="/profile" replace />;
    }

    return (
      <AuthCard title="Email confirmed ✅">
        <p className="has-text-centered has-text-grey-light">
          Your email has been changed
        </p>
        <p className="has-text-centered mt-4">
          <Link to="/login">Log in</Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Confirming email... 📬">
      <p className="has-text-centered has-text-grey-light">Please wait</p>
    </AuthCard>
  );
};
