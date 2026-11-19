import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

  return (
    <>
      <Formik
        initialValues={{
          password: '',
          confirmPassword: '',
        }}
        validateOnMount={true}
        onSubmit={({ password, confirmPassword }) => {
          return authService
            .resetPasswordConfirm({
              password,
              confirmPassword,
              token: activationToken,
            })
            .then(() => {
              navigate('/login');
            })
            .catch(error => {
              if (error.status === 403) {
                setRequireActivation(true);
              }

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
              <label htmlFor="confirmPassword" className="label">
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
                  name="confirmPassword"
                  type="password"
                  id="confirmPassword"
                  placeholder="*******"
                  className={cn('input', {
                    'is-danger':
                      touched.confirmPassword && errors.confirmPassword,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>

                {touched.confirmPassword && errors.confirmPassword && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.confirmPassword && errors.confirmPassword ? (
                <p className="help is-danger">{errors.confirmPassword}</p>
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
                  isSubmitting || errors.confirmPassword || errors.password
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
