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
  newName: { type: 'name', label: 'New name' },
} as Fields;

export const ChangeNameForm: React.FC<Props> = ({ setUpdated, setError }) => {
  const handleSubmit: SubmitCallback = async ({ newName }, formikHelpers) => {
    formikHelpers.setSubmitting(true);

    userService
      .updateUserData('name', { newName })
      .then(() => setUpdated(true))
      .catch((e) => catchError(e, setError))
      .finally(() => formikHelpers.setSubmitting(false));
  };

  return <FormTemplate fields={fields} onSubmit={handleSubmit} />;
};
