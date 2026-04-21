import { useContext, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { AuthContext } from '../components/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { usePageError } from '../hooks/usePageError.js';

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

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
  const [openForm, setOpenForm] = useState(null);

  const [nameError, setNameError] = usePageError('');
  const [nameSuccess, setNameSuccess] = usePageError('');
  const [emailError, setEmailError] = usePageError('');
  const [emailSuccess, setEmailSuccess] = usePageError('');
  const [passwordError, setPasswordError] = usePageError('');
  const [passwordSuccess, setPasswordSuccess] = usePageError('');

  const toggle = key => setOpenForm(prev => (prev === key ? null : key));

  return (
    <>
      <h1 className="title">Profile</h1>

      {/* Name row */}
      <div className="box">
        <div className="is-flex is-justify-content-space-between is-align-items-center">
          <span>
            <strong>Name:</strong> {user.name}
          </span>
          <button
            className="button is-small is-light"
            onClick={() => toggle('name')}
          >
            {openForm === 'name' ? 'Cancel' : 'Change'}
          </button>
        </div>

        {openForm === 'name' && (
          <Formik
            initialValues={{ name: user.name }}
            validateOnMount={true}
            onSubmit={({ name }, formikHelpers) => {
              formikHelpers.setSubmitting(true);

              userService
                .changeName(name)
                .then(() => checkAuth())
                .then(() => {
                  setNameSuccess('Name changed successfully');
                  setOpenForm(null);
                })
                .catch(error => {
                  const { errors, message } = error.response?.data || {};

                  formikHelpers.setFieldError('name', errors?.name);

                  if (message) {
                    setNameError(message);
                  }
                })
                .finally(() => formikHelpers.setSubmitting(false));
            }}
          >
            {({ touched, errors, isSubmitting }) => (
              <Form className="mt-4">
                <div className="field">
                  <div className="control has-icons-left">
                    <Field
                      name="name"
                      type="text"
                      id="name"
                      className={cn('input', {
                        'is-danger': touched.name && errors.name,
                      })}
                    />

                    <span className="icon is-small is-left">
                      <i className="fa fa-user"></i>
                    </span>
                  </div>

                  {touched.name && errors.name && (
                    <p className="help is-danger">{errors.name}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className={cn(
                    'button is-success is-small has-text-weight-bold',
                    {
                      'is-loading': isSubmitting,
                    },
                  )}
                  disabled={isSubmitting || !!errors.name}
                >
                  Save
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>

      {nameSuccess && (
        <p className="notification is-success is-light">{nameSuccess}</p>
      )}
      {nameError && (
        <p className="notification is-danger is-light">{nameError}</p>
      )}

      {/* Email row */}
      <div className="box">
        <div className="is-flex is-justify-content-space-between is-align-items-center">
          <span>
            <strong>Email:</strong> {user.email}
          </span>
          <button
            className="button is-small is-light"
            onClick={() => toggle('email')}
          >
            {openForm === 'email' ? 'Cancel' : 'Change'}
          </button>
        </div>

        {openForm === 'email' && (
          <Formik
            initialValues={{ password: '', email: '' }}
            validateOnMount={true}
            onSubmit={({ password, email }, formikHelpers) => {
              formikHelpers.setSubmitting(true);

              userService
                .changeEmail(password, email)
                .then(() => {
                  formikHelpers.resetForm();
                  setEmailSuccess('We sent you an activation email');
                  setOpenForm(null);
                })
                .catch(error => {
                  const { errors, message } = error.response?.data || {};

                  formikHelpers.setFieldError('password', errors?.password);
                  formikHelpers.setFieldError('email', errors?.email);

                  if (message) {
                    setEmailError(message);
                  }
                })
                .finally(() => formikHelpers.setSubmitting(false));
            }}
          >
            {({ touched, errors, isSubmitting }) => (
              <Form className="mt-4">
                <div className="field">
                  <label htmlFor="emailPassword" className="label">
                    Current password
                  </label>

                  <div className="control has-icons-left">
                    <Field
                      name="password"
                      type="password"
                      id="emailPassword"
                      placeholder="*******"
                      className={cn('input', {
                        'is-danger': touched.password && errors.password,
                      })}
                    />

                    <span className="icon is-small is-left">
                      <i className="fa fa-lock"></i>
                    </span>
                  </div>

                  {touched.password && errors.password && (
                    <p className="help is-danger">{errors.password}</p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="newEmail" className="label">
                    New email
                  </label>

                  <div className="control has-icons-left">
                    <Field
                      validate={validateEmail}
                      name="email"
                      type="email"
                      id="newEmail"
                      placeholder="e.g. bobsmith@gmail.com"
                      className={cn('input', {
                        'is-danger': touched.email && errors.email,
                      })}
                    />

                    <span className="icon is-small is-left">
                      <i className="fa fa-envelope"></i>
                    </span>
                  </div>

                  {touched.email && errors.email && (
                    <p className="help is-danger">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className={cn(
                    'button is-success is-small has-text-weight-bold',
                    {
                      'is-loading': isSubmitting,
                    },
                  )}
                  disabled={isSubmitting || !!errors.email}
                >
                  Save
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>

      {emailSuccess && (
        <p className="notification is-success is-light">{emailSuccess}</p>
      )}
      {emailError && (
        <p className="notification is-danger is-light">{emailError}</p>
      )}

      {/* Password row */}
      <div className="box">
        <div className="is-flex is-justify-content-space-between is-align-items-center">
          <span>
            <strong>Password</strong>
          </span>
          <button
            className="button is-small is-light"
            onClick={() => toggle('password')}
          >
            {openForm === 'password' ? 'Cancel' : 'Change'}
          </button>
        </div>

        {openForm === 'password' && (
          <Formik
            initialValues={{
              oldPassword: '',
              newPassword: '',
              confirmation: '',
            }}
            validateOnMount={true}
            onSubmit={(
              { oldPassword, newPassword, confirmation },
              formikHelpers,
            ) => {
              formikHelpers.setSubmitting(true);

              userService
                .changePassword(oldPassword, newPassword, confirmation)
                .then(() => {
                  formikHelpers.resetForm();
                  setPasswordSuccess('Password changed successfully');
                  setOpenForm(null);
                })
                .catch(error => {
                  const { errors, message } = error.response?.data || {};

                  formikHelpers.setFieldError(
                    'oldPassword',
                    errors?.oldPassword,
                  );
                  formikHelpers.setFieldError(
                    'newPassword',
                    errors?.newPassword,
                  );
                  formikHelpers.setFieldError(
                    'confirmation',
                    errors?.confirmation,
                  );

                  if (message) {
                    setPasswordError(message);
                  }
                })
                .finally(() => formikHelpers.setSubmitting(false));
            }}
          >
            {({ touched, errors, isSubmitting, values }) => (
              <Form className="mt-4">
                <div className="field">
                  <label htmlFor="oldPassword" className="label">
                    Current password
                  </label>

                  <div className="control has-icons-left">
                    <Field
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
                  </div>

                  {touched.oldPassword && errors.oldPassword && (
                    <p className="help is-danger">{errors.oldPassword}</p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="newPassword" className="label">
                    New password
                  </label>

                  <div className="control has-icons-left">
                    <Field
                      validate={validatePassword}
                      name="newPassword"
                      type="password"
                      id="newPassword"
                      placeholder="*******"
                      className={cn('input', {
                        'is-danger': touched.newPassword && errors.newPassword,
                      })}
                    />

                    <span className="icon is-small is-left">
                      <i className="fa fa-lock"></i>
                    </span>
                  </div>

                  {touched.newPassword && errors.newPassword ? (
                    <p className="help is-danger">{errors.newPassword}</p>
                  ) : (
                    <p className="help">At least 6 characters</p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="confirmation" className="label">
                    Confirm new password
                  </label>

                  <div className="control has-icons-left">
                    <Field
                      validate={value =>
                        value !== values.newPassword
                          ? 'Passwords do not match'
                          : undefined
                      }
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
                  </div>

                  {touched.confirmation && errors.confirmation && (
                    <p className="help is-danger">{errors.confirmation}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className={cn(
                    'button is-success is-small has-text-weight-bold',
                    {
                      'is-loading': isSubmitting,
                    },
                  )}
                  disabled={
                    isSubmitting ||
                    !!errors.newPassword ||
                    !!errors.confirmation
                  }
                >
                  Save
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>

      {passwordSuccess && (
        <p className="notification is-success is-light">{passwordSuccess}</p>
      )}
      {passwordError && (
        <p className="notification is-danger is-light">{passwordError}</p>
      )}
    </>
  );
};
