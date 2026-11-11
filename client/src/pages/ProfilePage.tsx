import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { PasswordChange } from '../components/PasswordChange';
import { toast } from 'sonner';
import { userService } from '../services/userService';
import { User } from '../types/user';
import { EmailChange } from '../components/EmailChange';


export const ProfilePage = () => {
  const [ authentificatedUser, setAuthentificatedUser ] = useState<User | null>(null);
  const [editField, setEditField] = useState('');

  useEffect(() => {
    userService
      .getAuthentificatedUser()
      .then(setAuthentificatedUser)
      .catch(() => {
        toast.error('Failed to load user');
      });
  }, [editField]);

  if (!authentificatedUser) {
    return <p>Loading user...</p>;
  }

  return (
    <div className="box">
      <h2 className="title is-4 has-text-primary">Settings</h2>

      <Formik
        initialValues={{
          name: authentificatedUser.name,
          email: authentificatedUser.email,
        }}
        onSubmit={({name}) => {
            return userService
              .updateName(name)
              .then(() => {
                toast.success('Name successfully updated');
                setEditField('');
              })
              .catch(() => {
                toast.error('Failed to update name');
              });
          }
        }
      >
        {({ values, resetForm, isSubmitting }) => (
          <>
            <Form>
              {/* NAME */}
              <div className="field mb-5">
                <label className="label has-text-grey">Name</label>

                <div className="is-flex is-align-items-center is-justify-content-space-between">
                  {editField === 'name' ? (
                    <>
                      <Field
                        name="name"
                        className="input is-info"
                        autoFocus
                      />

                      <button
                        type="button"
                        className="button is-light ml-2"
                        onClick={() => {
                          resetForm();
                          setEditField('');
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="has-text-weight-semibold mr-3">
                        {values.name}
                      </span>

                      <button
                        type="button"
                        className="button is-small is-info is-light"
                        onClick={() => setEditField('name')}
                      >
                        <span className="icon">
                          <i className="fas fa-edit"></i>
                        </span>
                        <span>Edit</span>
                      </button>
                    </>
                  )}

                  {editField === 'name' && (
                    <button
                      type="submit"
                      className={cn('button is-success ml-2', {
                        'is-loading': isSubmitting,
                      })}
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>

              {/* EMAIL */}
              {/* <div className="field mb-5">
                <label className="label has-text-grey">Email</label>

                <div className="is-flex is-align-items-center is-justify-content-space-between">
                  {editField === 'email' ? (
                    <Field
                      name="email"
                      type="email"
                      className="input is-info"
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="has-text-weight-semibold mr-3">
                        {values.email}
                      </span>

                      <button
                        type="button"
                        className="button is-small is-info is-light"
                        onClick={() => setEditField('email')}
                      >
                        <span className="icon">
                          <i className="fas fa-edit"></i>
                        </span>
                        <span>Edit</span>
                      </button>
                    </>
                  )}

                  {editField === 'email' && (
                    <button
                      type="submit"
                      className={cn('button is-success ml-2', {
                        'is-loading': isSubmitting,
                      })}
                    >
                      Save
                    </button>
                  )}
                </div>
              </div> */}
            </Form>

            {/* EMAIL */}
            <div className="field">
              <label className="label has-text-grey">Email</label>

              {editField === 'email' ? (
                <EmailChange
                  onDone={() => {
                    setEditField('');
                  }}
                />
              ) : (
                <div className="is-flex is-align-items-center is-justify-content-space-between">
                  <span className="has-text-weight-semibold mr-3">
                    {authentificatedUser.email}
                  </span>

                  <div className="is-flex is-align-items-center">
                    <button
                      type="button"
                      className="button is-link is-light"
                      onClick={() => setEditField('email')}
                      disabled={editField !== ''}
                    >
                      Change email
                    </button>
                  </div>
                </div>
              )}
            </div>

            <hr />

            {/* PASSWORD */}
            <div className="field">
              <label className="label has-text-grey">Password</label>

              {editField === 'password' ? (
                <PasswordChange
                  onDone={() => {
                    setEditField('');
                  }}
                />
              ) : (
                <div className="is-flex is-align-items-center">
                  <button
                    type="button"
                    className="button is-link is-light"
                    onClick={() => setEditField('password')}
                    disabled={editField !== ''}
                  >
                    Change password
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </Formik>
    </div>
  );
};

