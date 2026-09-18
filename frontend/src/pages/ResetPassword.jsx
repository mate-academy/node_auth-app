import { Form, Formik, Field } from 'formik';
import { usePageError } from '../hooks/usePageError';
import { validateEmail } from '../helper/helperFunctions';
import cn from 'classnames';
import { authService } from '../services/authService';
import { useState } from 'react';

export const ResetPassword = () => {
  const [error, setError] = usePageError('');
  const [sendedEmail, setSendedEmail] = useState(false);

  if (sendedEmail) {
    return (
      <section className="">
        <h1 className="title">Check your email</h1>
        <p>If an account with this email exists, a reset link has been sent.</p>
        <p>
          For security reasons, you can request a new reset link only once every
          15 minutes.
        </p>
      </section>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          email: '',
        }}
        validateOnMount={true}
        onSubmit={({ email }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          authService
            .sendPassResetLink({ email })
            .then(() => setSendedEmail(true))
            .catch(error => {
              console.log(error);
              if (error.message) {
                setError(error.message);
              }

              if (!error.response?.data) {
                return;
              }

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('email', errors?.email);

              if (message) {
                setError(message);
              }
            })
            .finally(() => formikHelpers.setSubmitting(false));
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Reset password</h1>
            <div className="field">
              <label htmlFor="email" className="label">
                Email
              </label>
              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validateEmail}
                  name="email"
                  type="email"
                  id="email"
                  placeholder="e.g. bobsmith@gmail.com"
                  className={cn('input', {
                    'is-danger': touched.email && errors.email,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-envelope"></i>
                </span>

                {touched.email && errors.email && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}

                {touched.email && errors.email && (
                  <p className="help is-danger">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="field">
              <button
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={isSubmitting || errors.email}
              >
                Get password reset link
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
