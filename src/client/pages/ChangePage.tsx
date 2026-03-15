import { usePageError } from '../hooks/usePageError';
import { useParams } from 'react-router-dom';
import { ChangeNameForm } from '../components/ChangeNameForm';
import { ChangePassForm } from '../components/ChangePassForm';
import { ChangeEmailForm } from '../components/ChangeEmailForm';
import { useSuccessRedirect } from '../hooks/useSuccessRedirect';

export const ChangePage = () => {
  const [error, setError] = usePageError('');
  const { paramToChange } = useParams();
  const [updated, setUpdated] = useSuccessRedirect();

  return (
    <div className="content">
      <h1 className="title">Change {paramToChange}</h1>

      {updated ? (
        paramToChange === 'email' ? (
          <p className="notification is-success is-light">
            We have sent you an email with the activation link
          </p>
        ) : (
          <p className="notification is-success is-light">
            Your account has been successfully updated
          </p>
        )
      ) : (
        <>
          {paramToChange === 'name' && (
            <ChangeNameForm setError={setError} setUpdated={setUpdated} />
          )}
          {paramToChange === 'password' && (
            <ChangePassForm setError={setError} setUpdated={setUpdated} />
          )}
          {paramToChange === 'email' && (
            <ChangeEmailForm setError={setError} setUpdated={setUpdated} />
          )}
        </>
      )}

      {error && <p className="notification is-danger is-light">{error}</p>}
    </div>
  );
};
