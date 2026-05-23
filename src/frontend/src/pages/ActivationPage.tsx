import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { activation } from '../api/auth';
import { Loader } from './components/Loader';

export const ActivationPage: React.FC = () => {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const { activationToken } = useParams();
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!activationToken) {
  //     return;
  //   }

  //   activation(activationToken)
  //     .then(setUser)
  //     .catch((error) => {
  //       if (error instanceof Error) {
  //         setError(error.message);
  //       }
  //     })
  //     .finally(() => setDone(true));
  //   navigate('/profile');
  // }, [setUser, activationToken, navigate]);

  useEffect(() => {
    async function init() {
      if (!activationToken) {
        return;
      }

      try {
        const user = await activation(activationToken);

        setUser(user);
        setDone(true);

        navigate('/profile');
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    }

    init();
  }, [setUser, activationToken, navigate]);

  if (!done) {
    return <Loader />;
  }

  return (
    <div>
      <h2 className="title">Account activation</h2>

      {error ? (
        <p className="notification">{error}</p>
      ) : (
        <p className="notification">Your account is now active</p>
      )}
    </div>
  );
};
