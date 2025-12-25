import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import { authService } from "../services/authService";
import cn from "classnames";

import { usePageError } from "../hooks/usePageError";
import { useAuth } from "../components/AuthContext";
import { AxiosError } from "axios";

export const PasswordResetConfirmPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = usePageError("");

  const { isChecked, currentUser } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/" />;
  }

  if (!token) {
    return (
      <p className="notification is-danger is-light">
        Invalid or expired reset link
      </p>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          password: "",
          confirmPassword: "",
        }}
        validate={({ password, confirmPassword }) => {
          const errors: Record<string, string> = {};

          if (!password) {
            errors.password = "Password is required";
          } else if (password.length < 6) {
            errors.password = "At least 6 characters";
          }

          if (!confirmPassword) {
            errors.confirmPassword = "Confirm your password";
          } else if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
          }

          return errors;
        }}
        onSubmit={({ password, confirmPassword }, { setSubmitting }) => {
          return authService
            .confirmPasswordReset(token, password, confirmPassword)
            .then(() => navigate("/password-reset/success"))
            .catch((error: AxiosError<{ message?: string }>) => {
              setError(error.response?.data?.message ?? "");
            })
            .finally(() => setSubmitting(false));
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Reset Password confirmation page</h1>
            <div className="field">
              <label htmlFor="password" className="label">
                New password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  name="password"
                  type="password"
                  id="password"
                  placeholder="*******"
                  className={cn("input", {
                    "is-danger": touched.password && errors.password,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>

                {touched.password && errors.password && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.password && errors.password ? (
                <p className="help is-danger">{errors.password}</p>
              ) : (
                <p className="help">At least 6 characters</p>
              )}
            </div>
            <div className="field">
              <label htmlFor="confirmPassword" className="label">
                Confirm password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  name="confirmPassword"
                  type="password"
                  id="confirmPassword"
                  placeholder="*******"
                  className={cn("input", {
                    "is-danger":
                      touched.confirmPassword && errors.confirmPassword,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>

                {touched.confirmPassword && errors.confirmPassword && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.confirmPassword && errors.confirmPassword && (
                <p className="help is-danger">{errors.confirmPassword}</p>
              )}
            </div>
            <div className="field">
              <button
                type="submit"
                className={cn("button is-success has-text-weight-bold", {
                  "is-loading": isSubmitting,
                })}
                disabled={
                  isSubmitting || !!errors.password || !!errors.confirmPassword
                }
              >
                Reset password
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
