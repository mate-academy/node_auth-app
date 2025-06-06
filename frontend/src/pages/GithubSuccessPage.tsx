import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { accessTokenService } from '../services/accessTokenService';
import { useAuth } from '../components/AuthContext';

export const GithubSuccessPage = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const { accessToken } = useParams<{ accessToken: string }>();

  useEffect(() => {
    const processGithubLogin = async () => {
      if (accessToken) {
        accessTokenService.save(accessToken);
        try {
          await checkAuth();
          navigate('/profile');
        } catch (error) {
          console.error('Error during GitHub auth:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    void processGithubLogin();
  }, [accessToken, checkAuth, navigate]);

  return <p>Processing GitHub login...</p>;
};
