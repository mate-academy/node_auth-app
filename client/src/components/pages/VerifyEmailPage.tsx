import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifyEmail, verifyNewEmail } from '../../api/user';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  console.log(token);

  useEffect(() => {
    const verify = async (token: string, email: string | null) => {
      try {
        let user;

        if (!email) {
          user = await verifyEmail(token);
        } else {
          user = await verifyNewEmail({token, email});
        }

        console.log(user);

        navigate('/login');
      } catch (error) {
        setError(true);

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    if (token) {
      verify(token, email);
    } else {
      navigate('/login');
    }
  }, []);

  return !error ? (
    <h1>Wait for verification...</h1>
  ) : (
    <h1>Bad request. Redirecting to login page...</h1>
  );
};
