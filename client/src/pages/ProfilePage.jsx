import React, { useContext, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { AuthContext } from '../components/AuthContext.jsx';
import { userService } from '../services/userService.js';

export const ProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [nameMsg, setNameMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [emailMsg, setEmailMsg] = useState('');

  const submitName = async (values) => {
    try {
      await userService.updateName(values.name);
      updateUser({ name: values.name });
      setNameMsg('Name updated successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update name';
      setNameMsg(errorMsg);
    }
  };

  const submitPassword = async (values, { setErrors, resetForm }) => {
    setPasswordMsg('');

    try {
      await userService.updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      setPasswordMsg('Password changed successfully!');
      resetForm();
    } catch (err) {
      const backendMsg = err.response?.data?.message;

      if (backendMsg && backendMsg.includes('old password')) {
        setErrors({ oldPassword: backendMsg });
      } else if (backendMsg &&  backendMsg.includes('at least')) {
        setErrors({ newPassword: backendMsg });
      } else {
        setErrors({ oldPassword: 'Failed to update password' });
      }
    }
  };

  const submitEmailRequest = async (values, { setErrors, resetForm }) => {
    setEmailMsg('');

    try {
      await userService.requestEmailChange(values);
      setEmailMsg('Check your new email for the confirmation');
      resetForm();
    } catch (err) {
      const backendMsg = err.response?.data?.message;

      if (backendMsg && backendMsg.includes('password')) {
        setErrors({ password: 'Wrong password' });
      } else {
        setErrors({ newEmail: backendMsg });
      }
    }
  };

  return (
    <div className="container">
      <h1 className="title">Profile: {user?.name}, {user?.email}</h1>

      <div className="box">
        <h3 className="subtitle">Update Name</h3>
        <Formik
          initialValues={{ name: user?.name || '' }}
          enableReinitialize={true}
          onSubmit={submitName}
        >
          <Form>
            <Field name="name" className="input" placeholder="Your Name" />
            <button type="submit" className="button is-success mt-2">Save Name</button>
            {nameMsg && <div className="notification is-success mt-2">{nameMsg}</div>}
          </Form>
        </Formik>
      </div>

      <div className="box">
        <h3 className="subtitle">Change Password</h3>
        <Formik
          initialValues={{ oldPassword: '', newPassword: '', confirmPassword: '' }}
          validate={values => {
            const errors = {};

            if (values.newPassword && values.oldPassword && values.newPassword === values.oldPassword) {
              errors.newPassword = "New password cannot be the same as the old one";
            }
            if (values.newPassword !== values.confirmPassword) {
              errors.confirmPassword = "Passwords don't match";
            }
            return errors;
          }}
          onSubmit={submitPassword}
        >
          {({ errors, touched }) => (
            <Form>
              <Field name="oldPassword" type="password" className="input" placeholder="Old Password" />
              {errors.oldPassword && touched.oldPassword && <p className="help is-danger">{errors.oldPassword}</p>}
              <Field name="newPassword" type="password" className="input mt-2" placeholder="New Password" />
              {errors.newPassword && touched.newPassword && (
                <p className="help is-danger">{errors.newPassword}</p>
              )}
              <Field name="confirmPassword" type="password" className="input mt-2" placeholder="Confirm New Password" />
              {errors.confirmPassword && touched.confirmPassword && <p className="help is-danger">{errors.confirmPassword}</p>}
              <button type="submit" className="button is-success mt-2">Update Password</button>
              {passwordMsg && <div className="notification is-success mt-2">{passwordMsg}</div>}
            </Form>
          )}
        </Formik>
      </div>

      <div className="box">
        <h3 className="subtitle">Change Email</h3>
        <p className="is-size-7 mb-2">Changing email requires password verification and link confirmation.</p>
        <Formik
          initialValues={{ newEmail: '', password: '' }}
          enableReinitialize={true}
          onSubmit={submitEmailRequest}
        >
          {({ errors, touched }) => (
            <Form>
              <Field name="newEmail" type="email" className="input" placeholder="New Email" />
              {errors.newEmail && touched.newEmail && <p className="help is-danger">{errors.newEmail}</p>}
              <Field name="password" type="password" className="input mt-2" placeholder="Current Password" />
              {errors.password && touched.password && <p className="help is-danger">{errors.password}</p>}
              <button type="submit" className="button is-warning mt-2">Request Email Change</button>
              {emailMsg && <div className="notification is-info mt-2">{emailMsg}</div>}
            </Form>
          )}
        </Formik>
      </div>

      {/* {msg && <div className="notification is-success">{msg}</div>} */}
    </div>
  );
};
