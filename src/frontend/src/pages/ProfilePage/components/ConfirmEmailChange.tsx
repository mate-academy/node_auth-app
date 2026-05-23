import { useEffect, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { confirmEmailToken } from '../../../api/profile';
import { Loader } from '../../components/Loader';
import { CircleAlert, CircleCheck } from 'lucide-react';

type Status = 'success' | 'error' | null;

export const ConfirmEmailChange: React.FC = () => {
  const { emailChangeToken } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

// Prevent duplicate API requests in React StrictMode.
// In development mode, React may execute useEffect multiple times,
// which can trigger repeated confirmation requests for the same token.
// Since this endpoint is one-time-use (the token is invalidated after success),
// we use a ref guard to ensure the request runs only once per component lifecycle.

  const hasConfirmed = useRef(false);

  useEffect(() => {
    async function init() {
      if (hasConfirmed.current) {
        return;
      }

      hasConfirmed.current = true;

      setIsLoading(true);
      if (!emailChangeToken) {
        return;
      }

      try {
        await confirmEmailToken(emailChangeToken);
        setStatus('success');
      } catch (error) {
        if (error instanceof Error) {
          setStatus('error');
        }
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [emailChangeToken]);

  if (isLoading) {
    return <Loader />;
  }

  if (status === 'success') {
    return (
      <div className="profile-information-done">
        <CircleCheck size={50} color="green" />
        <h3 className="profile-information-title">
          Email changed successfully
        </h3>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="profile-information-done">
        <CircleAlert size={50} color="red" />
        <h3 className="profile-information-title">
          This confirmation link is invalid or expired.
        </h3>
        <NavLink to={'/profile'} className="form-link">
          Back to profile
        </NavLink>
      </div>
    );
  }
};
