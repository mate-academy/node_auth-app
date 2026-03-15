import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useSuccessRedirect = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) {
      return;
    }

    const updateAuth = async () => {
      await checkAuth();

      setTimeout(() => navigate('/profile'), 2000);
    };

    updateAuth();
  }, [done]);

  return [done, setDone] as const;
};
