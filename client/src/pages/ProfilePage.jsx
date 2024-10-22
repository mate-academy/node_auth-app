import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../components/AuthContext.jsx';
import { usePageError } from '../hooks/usePageError.js';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';
import { userService } from '../services/userService.js';
import { useParams, useNavigate } from 'react-router-dom';

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.includes(' ')) {
    return 'One word required';
  }

  if (value.length < 2) {
    return 'At least 2 characters';
  }
}

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

export const ProfilePage = () => {
  const { user, checkAuth } = useContext(AuthContext);
  const [error, setError] = usePageError('');
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="content">
      <h1 className="title">Profile Page</h1>
      <br />
      <h4>Hello {user.name}</h4>

      <Formik
        initialValues={{
          newName: '',
        }}
        validateOnMount={true}
        onSubmit={({ newName }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          userService
            .changeName({ userId, newName })
            .then((response) => {
              alert(response);
              checkAuth();
              formikHelpers.resetForm();
            })
            .catch((error) => {
              if (error.message) {
                setError(error.message);
              }

              if (!error.response?.data) {
                return;
              }

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('newName', errors?.newName);

              if (message) {
                setError(message);
              }
            })
            .finally(() => {
              formikHelpers.setSubmitting(false);
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h3 className="title">Change your name</h3>
            <div className="field">
              <label htmlFor="newName" className="label">
                New name
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validateName}
                  name="newName"
                  type="text"
                  id="newName"
                  placeholder="New name"
                  className={cn('input', {
                    'is-danger': touched.newName && errors.newName,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-person"></i>
                </span>

                {touched.newName && errors.newName && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.newName && errors.newName && (
                <p className="help is-danger">{errors.newName}</p>
              )}
            </div>

            <div className="field">
              <button
                style={{ marginTop: '10px' }}
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={isSubmitting || errors.newName}
              >
                Submit
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <Formik
        initialValues={{
          oldPassword: '',
          password: '',
          confirmation: '',
        }}
        validateOnMount={true}
        onSubmit={({ oldPassword, password, confirmation }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          userService
            .changeUserPassword({ userId, oldPassword, password, confirmation })
            .then((response) => {
              alert(response);
              checkAuth();
              formikHelpers.resetForm();
              navigate('/login');
            })
            .catch((error) => {
              if (error.message) {
                setError(error.message);
              }

              if (!error.response?.data) {
                return;
              }

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('oldPassword', errors?.oldPassword);
              formikHelpers.setFieldError('password', errors?.password);
              formikHelpers.setFieldError('confirmation', errors?.confirmation);

              if (message) {
                setError(message);
              }
            })
            .finally(() => {
              formikHelpers.setSubmitting(false);
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form style={{ marginTop: '20px' }} className="box">
            <h3 className="title">Change your password</h3>
            <div className="field">
              <label htmlFor="oldPassword" className="label">
                Old password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validatePassword}
                  name="oldPassword"
                  type="password"
                  id="oldPassword"
                  placeholder="*******"
                  className={cn('input', {
                    'is-danger': touched.oldPassword && errors.oldPassword,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>

                {touched.oldPassword && errors.oldPassword && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.oldPassword && errors.oldPassword ? (
                <p className="help is-danger">{errors.oldPassword}</p>
              ) : (
                <p className="help">At least 6 characters</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="new-password" className="label">
                New password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validatePassword}
                  name="password"
                  type="password"
                  id="new-password"
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
              <label htmlFor="confirm-password" className="label">
                Confirm password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validatePassword}
                  name="confirmation"
                  type="password"
                  id="confirm-password"
                  placeholder="*******"
                  className={cn('input', {
                    'is-danger': touched.confirmation && errors.confirmation,
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
                  isSubmitting ||
                  errors.oldPassword ||
                  errors.password ||
                  errors.confirmation
                }
              >
                Submit
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <Formik
        initialValues={{
          newEmail: '',
          password: '',
        }}
        validateOnMount={true}
        onSubmit={({ newEmail, password }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          userService
            .changeEmail({ userId, newEmail, password })
            .then((response) => {
              alert(response);
              checkAuth();
              formikHelpers.resetForm();
              navigate('/login');
            })
            .catch((error) => {
              if (error.message) {
                setError(error.message);
              }

              if (!error.response?.data) {
                return;
              }

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('newEmail', errors?.newEmail);
              formikHelpers.setFieldError('password', errors?.password);

              if (message) {
                setError(message);
              }
            })
            .finally(() => {
              formikHelpers.setSubmitting(false);
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Change Email</h1>
            <div className="field">
              <label htmlFor="newEmail" className="label">
                New email
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validateEmail}
                  name="newEmail"
                  type="email"
                  id="newEmail"
                  placeholder="e.g. bobsmith@gmail.com"
                  className={cn('input', {
                    'is-danger': touched.newEmail && errors.newEmail,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-envelope"></i>
                </span>

                {touched.newEmail && errors.newEmail && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.newEmail && errors.newEmail && (
                <p className="help is-danger">{errors.newEmail}</p>
              )}
            </div>
            <div className="field">
              <label htmlFor="password" className="label">
                Password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  // validate={validatePassword}
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
              <button
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={isSubmitting || errors.newEmail || errors.password}
              >
                Submit
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </div>
  );
};
