import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { authService } from '../services/authService';
import { AxiosError } from 'axios';
import { usePageError } from '../hooks/usePageError';
import { useAuth } from '../components/AuthContext';
import { Fields } from '../types/Fields';
import { SubmitCallback } from '../types/SubmitCallback';
import { FormTemplate } from '../components/FormTemplate';

type RegistrationError = AxiosError<{
  errors?: { email?: string; password?: string };
  message: string;
}>;

const fields = {
  name: { type: 'name', label: 'Name' },
  email: { type: 'email', label: 'Email' },
  password: { type: 'password', label: 'Password' },
} as Fields;

export const SignUpPage = () => {
  const [error, setError] = usePageError('');
  const [registered, setRegistered] = useState(false);

  const { isChecked, currentUser } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/" />;
  }

  if (registered) {
    return (
      <section className="">
        <h1 className="title">Check your email</h1>
        <p>We have sent you an email with the activation link</p>
      </section>
    );
  }

  const handleSubmit: SubmitCallback = async (
    { name, email, password },
    formikHelpers,
  ) => {
    formikHelpers.setSubmitting(true);

    authService
      .register(name, email, password)
      .then(() => setRegistered(true))
      .catch((e: RegistrationError) => {
        if (e.message) {
          setError(e.message);
        }

        if (!e.response?.data) {
          return;
        }

        const { errors, message } = e.response.data;

        formikHelpers.setFieldError('email', errors?.email);
        formikHelpers.setFieldError('password', errors?.password);

        if (message) {
          setError(message);
        }
      })
      .finally(() => formikHelpers.setSubmitting(false));
  };

  return (
    <div className="content">
      <FormTemplate
        fields={fields}
        onSubmit={handleSubmit}
        formTitle="Sign up"
        cancelButton={false}
        submitButtonName="Sign up"
      >
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </FormTemplate>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </div>
  );
};
