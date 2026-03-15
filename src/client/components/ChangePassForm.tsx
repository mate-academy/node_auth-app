import { userService } from '../services/userService';
import { Dispatch, SetStateAction } from 'react';
import { catchError } from '../utils/catchError';
import { Fields } from '../types/Fields';
import { SubmitCallback } from '../types/SubmitCallback';
import { FormTemplate } from './FormTemplate';

type Props = {
  setError: Dispatch<SetStateAction<string>>;
  setUpdated: Dispatch<SetStateAction<boolean>>;
};

const fields = {
  currentPassword: { type: 'password', label: 'Password' },
  newPassword: { type: 'password', label: 'New password' },
  confirmPassword: { type: 'password', label: 'Confirm password' },
} as Fields;

export const ChangePassForm: React.FC<Props> = ({ setError, setUpdated }) => {
  const handleSubmit: SubmitCallback = async (
    { currentPassword, newPassword, confirmPassword },
    formikHelpers,
  ) => {
    formikHelpers.setSubmitting(true);

    userService
      .updateUserData('password', {
        currentPassword,
        newPassword,
        confirmPassword,
      })
      .then(() => setUpdated(true))
      .catch((e) => catchError(e, setError))
      .finally(() => formikHelpers.setSubmitting(false));
  };

  return <FormTemplate fields={fields} onSubmit={handleSubmit} />;
};
