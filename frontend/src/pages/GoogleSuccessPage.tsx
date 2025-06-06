import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { accessTokenService } from '../services/accessTokenService';
import { useAuth } from '../components/AuthContext';

export const GoogleSuccessPage = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const { accessToken } = useParams<{ accessToken: string }>();

  useEffect(() => {
    const processGoogleLogin = async () => {
      if (accessToken) {
        accessTokenService.save(accessToken);
        try {
          await checkAuth();
          navigate('/profile');
        } catch (error) {
          console.error('Error during authentication:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    void processGoogleLogin();
  }, [accessToken, checkAuth, navigate]);

  return <p>Processing Google login...</p>;
};