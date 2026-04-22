import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAccessToken, fetchMe, getAccessToken } from './api';

export function useGuestOnly() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    if (!isCheckingAuth) {
      return;
    }

    fetchMe()
      .then(() => {
        navigate('/account', { replace: true });
      })
      .catch(() => {
        clearAccessToken();
        setIsCheckingAuth(false);
      });
  }, [isCheckingAuth, navigate]);

  return isCheckingAuth;
}
