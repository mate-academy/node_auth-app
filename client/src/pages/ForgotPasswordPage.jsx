import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { userService } from '../services/userService';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage = () => {
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await userService.forgotPassword(values.email);
      setIsSent(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="container mt-6">
        <div className="box has-text-centered">
          <h1 className="title">Check your email</h1>
          <p>We've sent a password reset link to your email address.</p>
          <Link to="/login" className="button is-link mt-4">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-6">
      <div className="columns is-centered">
        <div className="column is-half">
          <div className="box">
            <h1 className="title">Forgot Password</h1>
            <p className="mb-4">Enter your email and we'll send you a reset link.</p>

            <Formik initialValues={{ email: '' }} onSubmit={handleSubmit}>
              {({ isSubmitting }) => (
                <Form>
                  <div className="field">
                    <label className="label">Email</label>
                    <Field
                      name="email"
                      type="email"
                      className="input"
                      placeholder="e.g. alex@example.com"
                      required
                    />
                  </div>

                  {errorMsg && <p className="help is-danger mb-3">{errorMsg}</p>}

                  <button
                    type="submit"
                    className={`button is-success is-fullwidth ${isSubmitting ? 'is-loading' : ''}`}
                  >
                    Send Reset Link
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};
