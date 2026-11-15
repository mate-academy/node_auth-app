import React, { useContext } from 'react';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { AuthContext } from '../components/AuthContext.jsx';
import { profileService } from '../services/profileService.js';

// One labelled input with an error message under it
const FormField = ({ name, label, type = 'text', touched, errors, help }) => (
  <div className="field">
    <label htmlFor={name} className="label">
      {label}
    </label>

    <div className="control">
      <Field
        name={name}
        id={name}
        type={type}
        className={cn('input', {
          'is-danger': touched[name] && errors[name],
        })}
      />
    </div>

    {touched[name] && errors[name] ? (
      <p className="help is-danger">{errors[name]}</p>
    ) : (
      help && <p className="help">{help}</p>
    )}
  </div>
);

// Shows the result of the last submit (success or a general error)
const FormStatus = ({ status }) => {
  if (!status) {
    return null;
  }

  return (
    <p
      className={cn('notification is-light mt-3', {
        'is-success': status.success,
        'is-danger': status.error,
      })}
    >
      {status.success || status.error}
    </p>
  );
};

// Puts field errors from the server under the fields
// and the general message into the form status
function handleServerError(error, { setFieldError, setStatus }) {
  const data = error.response?.data;

  Object.entries(data?.errors || {}).forEach(([field, message]) => {
    if (message) {
      setFieldError(field, message);
    }
  });

  setStatus({ error: data?.message || error.message });
}

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

const NameForm = () => {
  const { user, setUser } = useContext(AuthContext);

  return (
    <Formik
      initialValues={{ name: user.name }}
      enableReinitialize
      validate={({ name }) => (name.trim() ? {} : { name: 'Name is required' })}
      onSubmit={({ name }, helpers) => {
        helpers.setStatus(null);

        return profileService
          .changeName(name)
          .then(({ user: updatedUser }) => {
            setUser(updatedUser);
            helpers.setStatus({ success: 'Name has been changed' });
          })
          .catch(error => handleServerError(error, helpers));
      }}
    >
      {({ touched, errors, isSubmitting, status }) => (
        <Form className="box">
          <h2 className="title is-4">Change name</h2>

          <FormField
            name="name"
            label="Name"
            touched={touched}
            errors={errors}
          />

          <button
            type="submit"
            className={cn('button is-success', { 'is-loading': isSubmitting })}
            disabled={isSubmitting}
          >
            Save name
          </button>

          <FormStatus status={status} />
        </Form>
      )}
    </Formik>
  );
};

const PasswordForm = () => (
  <Formik
    initialValues={{ oldPassword: '', newPassword: '', confirmation: '' }}
    validate={({ oldPassword, newPassword, confirmation }) => {
      const errors = {};

      if (!oldPassword) {
        errors.oldPassword = 'Old password is required';
      }

      const newPasswordError = validatePassword(newPassword);

      if (newPasswordError) {
        errors.newPassword = newPasswordError;
      }

      if (newPassword !== confirmation) {
        errors.confirmation = 'Passwords do not match';
      }

      return errors;
    }}
    onSubmit={(values, helpers) => {
      helpers.setStatus(null);

      return profileService
        .changePassword(values)
        .then(() => {
          helpers.resetForm();
          helpers.setStatus({ success: 'Password has been changed' });
        })
        .catch(error => handleServerError(error, helpers));
    }}
  >
    {({ touched, errors, isSubmitting, status }) => (
      <Form className="box">
        <h2 className="title is-4">Change password</h2>

        <FormField
          name="oldPassword"
          label="Old password"
          type="password"
          touched={touched}
          errors={errors}
        />

        <FormField
          name="newPassword"
          label="New password"
          type="password"
          help="At least 6 characters"
          touched={touched}
          errors={errors}
        />

        <FormField
          name="confirmation"
          label="Confirm new password"
          type="password"
          touched={touched}
          errors={errors}
        />

        <button
          type="submit"
          className={cn('button is-success', { 'is-loading': isSubmitting })}
          disabled={isSubmitting}
        >
          Change password
        </button>

        <FormStatus status={status} />
      </Form>
    )}
  </Formik>
);

const EmailForm = () => {
  const { setUser } = useContext(AuthContext);

  return (
    <Formik
      initialValues={{ password: '', newEmail: '', confirmation: '' }}
      validate={({ password, newEmail, confirmation }) => {
        const errors = {};

        if (!password) {
          errors.password = 'Password is required';
        }

        const emailError = validateEmail(newEmail);

        if (emailError) {
          errors.newEmail = emailError;
        }

        if (newEmail !== confirmation) {
          errors.confirmation = 'Emails do not match';
        }

        return errors;
      }}
      onSubmit={(values, helpers) => {
        helpers.setStatus(null);

        return profileService
          .changeEmail(values)
          .then(({ user: updatedUser }) => {
            setUser(updatedUser);
            helpers.resetForm();
            helpers.setStatus({
              success:
                'Email has been changed. We sent a notice to your old email.',
            });
          })
          .catch(error => handleServerError(error, helpers));
      }}
    >
      {({ touched, errors, isSubmitting, status }) => (
        <Form className="box">
          <h2 className="title is-4">Change email</h2>

          <FormField
            name="newEmail"
            label="New email"
            type="email"
            touched={touched}
            errors={errors}
          />

          <FormField
            name="confirmation"
            label="Confirm new email"
            type="email"
            touched={touched}
            errors={errors}
          />

          <FormField
            name="password"
            label="Current password"
            type="password"
            touched={touched}
            errors={errors}
          />

          <button
            type="submit"
            className={cn('button is-success', { 'is-loading': isSubmitting })}
            disabled={isSubmitting}
          >
            Change email
          </button>

          <FormStatus status={status} />
        </Form>
      )}
    </Formik>
  );
};

export const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      <div className="box">
        <h1 className="title">Profile</h1>

        <p>
          <strong>Name:</strong> {user.name}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <NameForm />
      <PasswordForm />
      <EmailForm />
    </>
  );
};
