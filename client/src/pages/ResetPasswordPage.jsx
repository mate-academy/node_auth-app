import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { AuthContext } from '../components/AuthContext.jsx';
import { usePageError } from '../hooks/usePageError.js';
import { CheckEmail } from '../components/CheckEmail.jsx';
import { useState } from 'react';
import { validationService } from '../services/validationService.js';
import { authClient } from '../http/authClient.js';
import { authService } from '../services/authService.js';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [isLetterSent, setLetterSent] = useState(false);

  const [error, setError] = usePageError('');

  if (isLetterSent) {
    return (
      <CheckEmail
        description={'We have sent you an email with reset password link'}
      />
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          email: '',
        }}
        validateOnMount={true}
        onSubmit={({ email }) => {
          return authService
            .resetPassword({ email })
            .then(() => {
              setLetterSent(true);
            })
            .catch(error => {
              setError(error.response?.data?.message);
            });
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
                  validate={validationService.validateEmail}
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
              </div>

              {touched.email && errors.email && (
                <p className="help is-danger">{errors.email}</p>
              )}
            </div>
            <div className="field">
              <button
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={isSubmitting || errors.email || errors.password}
              >
                Send letter
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
