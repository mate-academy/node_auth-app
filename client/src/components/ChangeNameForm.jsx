import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { useContext } from 'react';
import { profileService } from '../services/profileService';
import { AuthContext } from './AuthContext';
import { usePageError } from '../hooks/usePageError';

function validateName(name) {
  if (!name) {
    return 'Name is required';
  }

  if (name.trim().length < 2) {
    return 'At least 2 characters';
  }
}

export const ChangeNameForm = () => {
  const { user, setUser } = useContext(AuthContext);
  const [error, setError] = usePageError('');

  return (
    <>
      <Formik
        initialValues={{
          name: user.name,
        }}
        validateOnMount={true}
        onSubmit={({ name }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          profileService
            .updateName(name)
            .then(({ user }) => {
              setUser(user);
            })
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
              formikHelpers.setSubmitting(false);
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Update name</h1>
            <div className="field">
              <label htmlFor="name" className="label">
                Name
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validateName}
                  name="name"
                  type="text"
                  id="name"
                  placeholder="e.g. Bob Smith"
                  className={cn('input', {
                    'is-danger': touched.name && errors.name,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-user"></i>
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
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={isSubmitting || errors.name}
              >
                Update your name
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
