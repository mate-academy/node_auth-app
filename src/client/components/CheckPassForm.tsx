import { userService } from '../services/userService';
import { useAuth } from './AuthContext';
import { Dispatch, SetStateAction } from 'react';
import { catchError } from '../utils/catchError';
import { Fields } from '../types/Fields';
import { SubmitCallback } from '../types/SubmitCallback';
import { FormTemplate } from './FormTemplate';

type Props = {
  setError: Dispatch<SetStateAction<string>>;
  setChecked: Dispatch<SetStateAction<null | string>>;
};

const fields = {
  password: { type: 'password', label: 'Password' },
} as Fields;

export const CheckPassForm: React.FC<Props> = ({ setChecked, setError }) => {
  const { currentUser } = useAuth();

  const handleSubmit: SubmitCallback = async ({ password }, formikHelpers) => {
    formikHelpers.setSubmitting(true);

    userService
      .checkPassword(password, currentUser?.email || '')
      .then(() => setChecked(password))
      .catch((e) => catchError(e, setError))
      .finally(() => formikHelpers.setSubmitting(false));
  };

  return <FormTemplate fields={fields} onSubmit={handleSubmit} />;
};
