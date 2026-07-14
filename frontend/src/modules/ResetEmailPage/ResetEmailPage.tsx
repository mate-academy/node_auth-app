import { useEffect, useState } from 'react';

import styles from './styles.module.scss';
// import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { apiProfile } from '@/api/profile';

type Status =
  | { statusType: 'loading' }
  | { statusType: 'error'; errorMessage: string }
  | { statusType: 'activate'; message: string };

export const ResetEmailPage = () => {
  // const { t } = useTranslation();
  const params = useParams();
  const token = params.token || '';
  const [status, setStatus] = useState<Status>({ statusType: 'loading' });

  useEffect(() => {
    apiProfile.changeEmailConfirm(token)
      .then((data) => setStatus({ statusType: 'activate', message: data.message }))
      .catch((e) => {
        setStatus({ statusType: 'error', errorMessage: e.response.data.message });
      });
  }, [token]);

  return (
    <div className={styles.container}>
      {status.statusType === 'loading' && <h1>Loading....</h1>}
      {status.statusType === 'error' && <h1 style={{ color: 'red' }}>{status.errorMessage}</h1>}
      {status.statusType === 'activate' && <h1 style={{ color: 'green' }}>{status.message}</h1>}
    </div>
  );
};
