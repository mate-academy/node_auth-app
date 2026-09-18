import { useContext } from 'react';
import { usePageError } from '../hooks/usePageError';
import { userService } from '../services/userService';
import { Field, Form, Formik } from 'formik';
import cn from 'classnames';
import { validUserName } from '../helper/helperFunctions';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';

export const NameForm = ({ onSuccess, id }) => {
  const [error, setError] = usePageError('');
  const { checkAuth } = useContext(AuthContext);

  return (
    <>
      <h3 className="subtitle">Change Name</h3>
      <Formik
        initialValues={{ userName: '' }}
        validateOnMount={true}
        onSubmit={async ({ userName }, helpers) => {
          try {
            await userService.changeName(id, { userName });
            await checkAuth();

            onSuccess('Name has been successfully updated!');
            helpers.resetForm();
          } catch (error) {
            if (error.message) {
              setError(error.message);
            }

            if (!error.response?.data) {
              return;
            }

            const { errors, message } = error.response.data;

            helpers.setFieldError('userName', errors?.userName);

            if (message) {
              setError(message);
            }
          }
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <div className="field">
              <label htmlFor="userName" className="label">
                Name
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validUserName}
                  name="userName"
                  type="text"
                  id="userName"
                  placeholder="Enter your name"
                  className={cn('input', {
                    'is-danger': touched.userName && errors.userName,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-user"></i>
                </span>

                {touched.userName && errors.userName && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>
              {touched.userName && errors.userName ? (
                <p className="help is-danger">{errors.userName}</p>
              ) : (
                <p className="help">Use letters, spaces, ` or -, min 2 chars</p>
              )}
            </div>

            <div className="field">
              <button
                type="submit"
                className="button is-primary"
                disabled={isSubmitting || errors.userName}
              >
                Update Name
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <br />
      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
