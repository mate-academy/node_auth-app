import React from 'react';
import { usePageError } from '../hooks/usePageError.js';
import { AuthContext } from '../components/AuthContext.jsx';
import { useContext, useState } from 'react';
import cn from 'classnames';
import { Formik, Field, Form } from 'formik';
import { Link } from 'react-router-dom';
import { validationService } from '../services/validationService.js';
import { userService } from '../services/userService.js';
import { ProfileContext } from '../components/ProfileContext.jsx';
import { authService } from '../services/authService.js';

const PROFILE_TAB = {
  hidden: null,
  name: 'name',
  email: 'email',
  pass: 'pass',
};

export const ProfilePage = () => {
  const [error, setError] = usePageError('');
  const { profile: user, getProfile } = useContext(ProfileContext);
  const [activeTab, setActiveTab] = useState(PROFILE_TAB.hidden);

  const onChangeNameSubmit = ({ name }, formikHelpers) => {
    formikHelpers.setSubmitting(true);

    userService
      .updateUser({ id: user.id, name })
      .then(getProfile)
      .catch(error => {
        if (error.message) {
          setError(error.message);
        }

        if (!error.response?.data) {
          return;
        }

        const { errors, message } = error.response.data;

        formikHelpers.setFieldError('name', errors?.name);

        if (message) {
          setError(message);
        }
      })
      .finally(() => {
        setActiveTab(PROFILE_TAB.hidden);
        formikHelpers.setSubmitting(false);
      });
  };

  const onChangePassSubmit = (
    { oldPassword, password, confirmPassword },
    formikHelpers,
  ) => {
    formikHelpers.setSubmitting(true);

    authService
      .password({ oldPassword, password, confirmPassword })
      .catch(error => {
        if (error.message) {
          setError(error.message);
        }

        if (!error.response?.data) {
          return;
        }

        const { errors, message } = error.response.data;

        formikHelpers.setFieldError('oldPassword', errors?.oldPassword);
        formikHelpers.setFieldError('password', errors?.password);
        formikHelpers.setFieldError('confirmPassword', errors?.confirmPassword);

        if (message) {
          setError(message);
        }
      })
      .finally(() => {
        setActiveTab(PROFILE_TAB.hidden);
        formikHelpers.setSubmitting(false);
      });
  };

  const onChangeEmailSubmit = (
    { email, confirmEmail, password },
    formikHelpers,
  ) => {
    formikHelpers.setSubmitting(true);

    userService
      .updateEmail({ email, confirmation: confirmEmail, password })
      .catch(error => {
        if (error.message) {
          setError(error.message);
        }

        if (!error.response?.data) {
          return;
        }

        const { errors, message } = error.response.data;

        formikHelpers.setFieldError('email', errors?.email);
        formikHelpers.setFieldError('password', errors?.password);
        formikHelpers.setFieldError('confirmEmail', errors?.confirmation);

        if (message) {
          setError(message);
        }
      })
      .finally(() => {
        setActiveTab(PROFILE_TAB.hidden);
        formikHelpers.setSubmitting(false);
      });
  };

  return (
    <div className="content">
      <h1 className="title">Profile</h1>

      <div className="box columns">
        <div className="column is-one-fifth">
          <div className="is-flex is-align-items-center mb-2">
            <h5 className="mb-0 mr-1">Email:</h5>
            <span>{user?.email}</span>
          </div>
          <div>
            <button
              className="button is-info is-light"
              onClick={() => {
                setActiveTab(PROFILE_TAB.email);
              }}
            >
              Change email
            </button>
          </div>
        </div>
        <div className="column is-one-fifth">
          <div className="is-flex is-align-items-center mb-2">
            <h5 className="mb-0 mr-1">Name:</h5>
            <span>{user?.name}</span>
          </div>
          <div>
            <button
              className="button is-info is-light"
              onClick={() => {
                setActiveTab(PROFILE_TAB.name);
              }}
            >
              Change name
            </button>
          </div>
        </div>
        <div className="column is-one-fifth">
          <div className="is-flex is-align-items-center mb-2">
            <h5 className="mb-0 mr-1">Password:</h5>
            <span>*******</span>
          </div>
          <div>
            <button
              className="button is-info is-light"
              onClick={() => {
                setActiveTab(PROFILE_TAB.pass);
              }}
            >
              Change password
            </button>
          </div>
        </div>
      </div>

      {activeTab === PROFILE_TAB.name && (
        <Formik
          initialValues={{
            name: user.name,
          }}
          validateOnMount={true}
          onSubmit={onChangeNameSubmit}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form className="box">
              <h1 className="title">Change Name</h1>
              <div className="field">
                <label htmlFor="name" className="label">
                  Name
                </label>

                <div className="control has-icons-left has-icons-right">
                  <Field
                    validate={validationService.validateName}
                    name="name"
                    type="name"
                    id="name"
                    placeholder="Oleksandr Orel"
                    className={cn('input', {
                      'is-danger': touched.name && errors.name,
                    })}
                  />

                  <span className="icon is-small is-left">
                    <i className="fa fa-address-card"></i>
                  </span>

                  {touched.name && errors.name && (
                    <span className="icon is-small is-right has-text-danger">
                      <i className="fas fa-exclamation-triangle"></i>
                    </span>
                  )}
                </div>

                {touched.name && errors.name && (
                  <p className="help is-danger">{errors.name}</p>
                )}
              </div>
              <div className="field">
                <button
                  type="submit"
                  className={cn('button mr-2 is-success has-text-weight-bold', {
                    'is-loading': isSubmitting,
                  })}
                  disabled={isSubmitting || errors.name}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className={cn('button is-danger has-text-weight-bold')}
                  onClick={() => setActiveTab(PROFILE_TAB.hidden)}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {activeTab === PROFILE_TAB.pass && (
        <Formik
          initialValues={{
            oldPassword: '',
            password: '',
            confirmPassword: '',
          }}
          validateOnMount={true}
          onSubmit={onChangePassSubmit}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form className="box">
              <h1 className="title">Change Password</h1>
              <div className="field">
                <label htmlFor="oldPassword" className="label">
                  Old password
                </label>

                <div className="control has-icons-left has-icons-right">
                  <Field
                    validate={validationService.validatePassword}
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

                {touched.oldPassword && errors.oldPassword && (
                  <p className="help is-danger">{errors.oldPassword}</p>
                )}
              </div>

              <div className="field">
                <label htmlFor="password" className="label">
                  New password
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

                {touched.password && errors.password && (
                  <p className="help is-danger">{errors.password}</p>
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

                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="help is-danger">{errors.confirmPassword}</p>
                )}
              </div>
              <div className="field">
                <button
                  type="submit"
                  className={cn('button mr-2 is-success has-text-weight-bold', {
                    'is-loading': isSubmitting,
                  })}
                  disabled={
                    isSubmitting ||
                    errors.oldPassword ||
                    errors.password ||
                    errors.confirmPassword
                  }
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className={cn('button is-danger has-text-weight-bold')}
                  onClick={() => setActiveTab(PROFILE_TAB.hidden)}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {activeTab === PROFILE_TAB.email && (
        <Formik
          initialValues={{
            email: '',
            password: '',
            confirmEmail: '',
          }}
          validateOnMount={true}
          onSubmit={onChangeEmailSubmit}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form className="box">
              <h1 className="title">Change Email</h1>
              <div className="field">
                <label htmlFor="email" className="label">
                  New Email
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

                  {touched.oldPassword && errors.oldPassword && (
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
                <label htmlFor="confirmEmail" className="label">
                  Confirm Email
                </label>

                <div className="control has-icons-left has-icons-right">
                  <Field
                    validate={value => {
                      return validationService.validateConfirmationEmail(
                        value,
                        values.email,
                      );
                    }}
                    name="confirmEmail"
                    type="email"
                    id="confirmEmail"
                    placeholder="e.g. bobsmith@gmail.com"
                    className={cn('input', {
                      'is-danger': touched.confirmEmail && errors.confirmEmail,
                    })}
                  />

                  <span className="icon is-small is-left">
                    <i className="fa fa-envelope"></i>
                  </span>

                  {touched.confirmEmail && errors.confirmEmail && (
                    <span className="icon is-small is-right has-text-danger">
                      <i className="fas fa-exclamation-triangle"></i>
                    </span>
                  )}
                </div>

                {touched.confirmEmail && errors.confirmEmail && (
                  <p className="help is-danger">{errors.confirmEmail}</p>
                )}
              </div>

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

                {touched.password && errors.password && (
                  <p className="help is-danger">{errors.password}</p>
                )}
              </div>

              <div className="field">
                <button
                  type="submit"
                  className={cn('button mr-2 is-success has-text-weight-bold', {
                    'is-loading': isSubmitting,
                  })}
                  disabled={
                    isSubmitting ||
                    errors.oldPassword ||
                    errors.password ||
                    errors.confirmPassword
                  }
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className={cn('button is-danger has-text-weight-bold')}
                  onClick={() => setActiveTab(PROFILE_TAB.hidden)}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {error && <p className="notification is-danger is-light">{error}</p>}
    </div>
  );
};
