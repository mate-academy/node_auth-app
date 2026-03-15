import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { usePageError } from '../hooks/usePageError';
import { useAuth } from '../components/AuthContext';
import { catchError } from '../utils/catchError';
import { Fields } from '../types/Fields';
import { SubmitCallback } from '../types/SubmitCallback';
import { FormTemplate } from '../components/FormTemplate';

const fields = {
  email: { type: 'email', label: 'Email' },
  password: { type: 'password', label: 'Password' },
} as Fields;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = usePageError('');
  const { login, isChecked, currentUser } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/profile" />;
  }

  const handleSubmit: SubmitCallback = async ({ email, password }) => {
    return login(email, password)
      .then(() => {
        const state = location.state as { from?: Location };

        navigate(state.from?.pathname ?? '/profile');
      })
      .catch((e) => catchError(e, setError));
  };

  return (
    <div className="content">
      <FormTemplate
        fields={fields}
        onSubmit={handleSubmit}
        cancelButton={false}
        formTitle="Log in"
        submitButtonName="Log in"
      >
        Do not have an account? <Link to="/sign-up">Sign up</Link>
      </FormTemplate>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </div>
  );
};
