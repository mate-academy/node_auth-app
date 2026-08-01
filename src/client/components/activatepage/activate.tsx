import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser } from '../../utils/fecthClient';

export const Activate: React.FC = () => {
  const [error, setError] = useState<'loading' | 'error' | 'success'>(
    'loading',
  );
  const { activationToken } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getUser(`/activate/${activationToken}`)
      .then((response) => {
        setError('success');

        setTimeout(() => {
          navigate(`/profile/${response.user.id}`);
        }, 3000);
      })
      .catch((errors) => {
        setError('error');
        // eslint-disable-next-line no-console
        console.log(`error: ${errors}`);
      });
  }, [activationToken]);

  return (
    <section className="activate">
      <div className="activate__content">
        <div className="activate__container">
          <h2 className="activate__title">Account activation</h2>
          {error === 'error' && (
            <p className="activate__error">Account error activated</p>
          )}
          {error === 'success' && (
            <p className="activate__success">Account successfully activated</p>
          )}
        </div>
      </div>
    </section>
  );
};
