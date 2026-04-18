import { useState } from 'react';
import { Formik, Form, Field, FormikErrors } from 'formik';
import cn from 'classnames';
import { userService } from '../services/userService';
import { useAuth } from '../components/AuthContext';

interface PasswordValues {
  oldPassword?: string;
  newPassword?: string;
  confirmation?: string;
}

export const ProfilePage = () => {
  const { currentUser, checkAuth } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');

  if (!currentUser) return <div className="section">Loading...</div>;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="container section">
      <h1 className="title">Profile Settings</h1>
      
      {successMessage && (
        <div className="notification is-success is-light">
          {successMessage}
        </div>
      )}

      <div className="box">
        <h2 className="subtitle">Change Name</h2>
        <Formik
          initialValues={{ name: currentUser.name || '' }}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await userService.updateName(values.name);
              await checkAuth();
              showSuccess('Name updated successfully!');
            } catch {
              alert('Error updating name');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="field">
                <div className="control has-icons-left">
                  <Field name="name" className="input" placeholder="Name" />
                  <span className="icon is-small is-left">
                    <i className="fas fa-user"></i>
                  </span>
                </div>
              </div>
              <button 
                type="submit" 
                className={cn('button is-link', { 'is-loading': isSubmitting })}
                disabled={isSubmitting}
              >
                Update Name
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="box">
        <h2 className="subtitle">Change Email</h2>
        <Formik
          initialValues={{ newEmail: '', password: '' }}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            try {
              await userService.updateEmail(values);
              showSuccess('Your email updated successfully');
              resetForm();
            } catch {
              alert('Error updating email');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="field">
                <label className="label">New Email</label>
                <div className="control">
                  <Field name="newEmail" type="email" className="input" required />
                </div>
              </div>
              <div className="field">
                <label className="label">Current Password</label>
                <div className="control">
                  <Field name="password" type="password" className="input" required />
                </div>
              </div>
              <button 
                type="submit" 
                className={cn('button is-link', { 'is-loading': isSubmitting })}
                disabled={isSubmitting}
              >
                Change Email
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="box">
        <h2 className="subtitle">Change Password</h2>
        <Formik
          initialValues={{ oldPassword: '', newPassword: '', confirmation: '' }}
          validate={(values: PasswordValues) => {
            const errors: FormikErrors<PasswordValues> = {};
            if (values.newPassword !== values.confirmation) {
              errors.confirmation = 'Passwords must match';
            }
            if (values.newPassword && values.newPassword.length < 6) {
              errors.newPassword = 'Too short';
            }
            return errors;
          }}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            try {
              await userService.updatePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
              });
              showSuccess('Password changed successfully!');
              resetForm();
            } catch {
              alert('Error changing password');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="field">
                <label className="label">Old Password</label>
                <Field name="oldPassword" type="password" className="input" required />
              </div>
              <div className="field">
                <label className="label">New Password</label>
                <Field 
                  name="newPassword" 
                  type="password" 
                  className={cn('input', { 'is-danger': touched.newPassword && errors.newPassword })} 
                  required
                />
                {touched.newPassword && errors.newPassword && <p className="help is-danger">{errors.newPassword}</p>}
              </div>
              <div className="field">
                <label className="label">Confirm New Password</label>
                <Field 
                  name="confirmation" 
                  type="password" 
                  className={cn('input', { 'is-danger': touched.confirmation && errors.confirmation })} 
                  required
                />
                {touched.confirmation && errors.confirmation && <p className="help is-danger">{errors.confirmation}</p>}
              </div>
              <button 
                type="submit" 
                className={cn('button is-link', { 'is-loading': isSubmitting })}
                disabled={isSubmitting}
              >
                Change Password
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};