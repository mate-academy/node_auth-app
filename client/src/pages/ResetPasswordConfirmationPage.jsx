import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { usePageError } from '../hooks/usePageError.js';
import { useState } from 'react';
import { validationService } from '../services/validationService.js';
import { authService } from '../services/authService.js';

export const ResetPasswordConfirmationPage = () => {
  const navigate = useNavigate();

  const [error, setError] = usePageError('');
  const { activationToken } = useParams();
  const [isPassChanged, setPassChanged] = useState(false);

  if (isPassChanged) {
    return (
      <div>
        <p>Password reset successfully!</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          password: '',
          confirmation: '',
        }}
        validateOnMount={true}
        onSubmit={({ password, confirmation }) => {
          return authService
            .resetPasswordConfirm({
              password,
              confirmation,
              token: activationToken,
            })
            .then(() => {
              setPassChanged(true);
            })
            .catch(error => {
              setError(error.response?.data?.message);
            });
        }}
      >
        {({ touched, errors, isSubmitting, values }) => (
          <Form className="box">
            <h1 className="title">Set up new password:</h1>
            <div className="field">
              <label htmlFor="password" className="label">
                Password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validationService.validatePassword}
                  name="password"
                  type="password"
                  id="password"
                  placeholder="*******"
                  className={cn('input', {
                    'is-danger': touched.password && errors.password,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>

                {touched.password && errors.password && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.password && errors.password ? (
                <p className="help is-danger">{errors.password}</p>
              ) : (
                <p className="help">At least 6 characters</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="confirmation" className="label">
                Confirm password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={value => {
                    return validationService.validateConfirmationPassword(
                      value,
                      values.password,
                    );
                  }}
                  name="confirmation"
                  type="password"
                  id="confirmation"
                  placeholder="*******"
                  className={cn('input', {
                    'is-danger':
                      touched.confirmation && errors.confirmation,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>

                {touched.confirmation && errors.confirmation && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.confirmation && errors.confirmation ? (
                <p className="help is-danger">{errors.confirmation}</p>
              ) : (
                <p className="help">At least 6 characters</p>
              )}
            </div>
            <div className="field">
              <button
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={
                  isSubmitting || errors.confirmation || errors.password
                }
              >
                Confirm
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
