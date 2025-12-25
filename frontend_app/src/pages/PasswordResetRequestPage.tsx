import { Navigate, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import cn from "classnames";

import { usePageError } from "../hooks/usePageError";
import { authService } from "../services/authService";
import { useAuth } from "../components/AuthContext";
import { AxiosError } from "axios";

const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

function validateEmail(value: string) {
  if (!value) return "Email is required";
  if (!EMAIL_PATTERN.test(value)) return "Email is not valid";
}

export const PasswordResetRequestPage = () => {
  const navigate = useNavigate();

  const [error, setError] = usePageError("");
  const { isChecked, currentUser } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Formik
        initialValues={{
          email: "",
        }}
        validateOnMount={true}
        onSubmit={({ email }) => {
          return authService
            .requestPasswordReset(email)
            .then(() => navigate("/password-reset/sent"))
            .catch((error: AxiosError<{ message?: string }>) => {
              setError(error.response?.data?.message ?? "");
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Password reset</h1>
            <div className="field">
              <label htmlFor="email" className="label">
                Email
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validateEmail}
                  name="email"
                  type="email"
                  id="email"
                  placeholder="e.g. bobsmith@gmail.com"
                  className={cn("input", {
                    "is-danger": touched.email && errors.email,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-envelope"></i>
                </span>

                {touched.email && errors.email && (
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
              <button
                type="submit"
                className={cn("button is-success has-text-weight-bold", {
                  "is-loading": isSubmitting,
                })}
                disabled={isSubmitting || !!errors.email}
              >
                Send reset link
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
