import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../components/AuthContext';

export const ForgotPasswordPage = () => {
  const [isSent, setIsSent] = useState(false);
  const { currentUser, isChecked } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/" replace />;
  }

  if (isSent) {
    return (
      <div className="section container">
        <div className="box">
          <h1 className="title">Check your email</h1>
          <p>If an account exists for that email, we have sent a password reset link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section container">
      <div className="box">
        <h1 className="title">Reset Password</h1>
        <Formik
          initialValues={{ email: '' }}
          onSubmit={async (values) => {
            try {
              await authService.forgotPassword(values.email);
            } finally {
              setIsSent(true);
            }
          }}
        >
          <Form>
            <div className="field">
              <label className="label">Email address</label>
              <Field name="email" type="email" className="input" placeholder="e.g. bob@gmail.com" required />
            </div>
            <button type="submit" className="button is-primary">Send Reset Link</button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};