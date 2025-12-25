import { Formik, Form, Field } from "formik";
import cn from "classnames";
import { useAuth } from "../components/AuthContext";
import { usePageError } from "../hooks/usePageError";
import { authService } from "../services/authService";
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
} from "../utils/validators";
import { useRef, useState } from "react";
import type { AxiosError } from "axios";

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string>;
};

export const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [error] = usePageError("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  if (!currentUser) {
    return null;
  }

  const timeoutRef = useRef<number>(null);

  const showSuccess = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    message: string
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setter(message);

    timeoutRef.current = window.setTimeout(() => {
      setter("");
    }, 3000);
  };

  return (
    <div className="content">
      <h1 className="title">Profile</h1>

      <Formik
        initialValues={{ name: currentUser?.name ?? "" }}
        validateOnMount
        onSubmit={({ name }, helpers) => {
          setNameSuccess("");

          authService
            .changeName(name)
            .then(() => {
              helpers.resetForm({ values: { name } });
              showSuccess(setNameSuccess, "Name updated successfully");
            })
            .catch((err: AxiosError<ApiErrorResponse>) => {
              const data = err.response?.data;

              if (data?.errors?.name) {
                helpers.setFieldError("name", data.errors.name);
                return;
              }

              if (data?.message) {
                helpers.setFieldError("name", data.message);
                return;
              }

              helpers.setFieldError("name", "Failed to update name");
            })
            .finally(() => helpers.setSubmitting(false));
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h2 className="title is-5">Change name</h2>
            <div className="field">
              <div className="control">
                <Field
                  name="name"
                  validate={validateName}
                  className={cn("input", {
                    "is-danger": touched.name && errors.name,
                  })}
                  placeholder="Enter name"
                />
              </div>
              {touched.name && errors.name && (
                <p className="help is-danger">{errors.name}</p>
              )}
            </div>

            <div className="field">
              <button
                type="submit"
                className="button is-success"
                disabled={isSubmitting || !!errors.name}
              >
                Save
              </button>
            </div>
            {nameSuccess && (
              <p className="notification is-success is-light">{nameSuccess}</p>
            )}
          </Form>
        )}
      </Formik>

      <Formik
        initialValues={{
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }}
        validateOnMount
        onSubmit={({ oldPassword, newPassword, confirmPassword }, helpers) => {
          setPasswordSuccess("");

          authService
            .changePassword(oldPassword, newPassword, confirmPassword)
            .then(() => {
              helpers.resetForm();
              showSuccess(setPasswordSuccess, "Password changed successfully");
            })
            .catch((err: AxiosError<ApiErrorResponse>) => {
              const data = err.response?.data;

              if (data?.errors) {
                Object.entries(data.errors).forEach(([field, message]) => {
                  helpers.setFieldError(field, message);
                });
                return;
              }

              if (data?.message) {
                helpers.setFieldError("oldPassword", data.message);
                return;
              }

              helpers.setFieldError("oldPassword", "Server error");
            })
            .finally(() => helpers.setSubmitting(false));
        }}
      >
        {({ touched, errors, values, isSubmitting }) => (
          <Form className="box">
            <h2 className="title is-5">Change password</h2>

            <div className="field">
              <div className="control">
                <Field
                  name="oldPassword"
                  type="password"
                  validate={validatePassword}
                  className={cn("input", {
                    "is-danger": touched.oldPassword && errors.oldPassword,
                  })}
                  placeholder="Old password"
                />
              </div>
            </div>

            <div className="field">
              <div className="control">
                <Field
                  name="newPassword"
                  type="password"
                  validate={validatePassword}
                  className={cn("input", {
                    "is-danger": touched.newPassword && errors.newPassword,
                  })}
                  placeholder="New password"
                />
              </div>
            </div>

            <div className="field">
              <div className="control">
                <Field
                  name="confirmPassword"
                  type="password"
                  validate={(value: string) =>
                    validateConfirmPassword(value, values.newPassword)
                  }
                  className={cn("input", {
                    "is-danger":
                      touched.confirmPassword && errors.confirmPassword,
                  })}
                  placeholder="Confirm new password"
                />
              </div>
              {(errors.oldPassword ||
                errors.newPassword ||
                errors.confirmPassword) && (
                <p className="help is-danger">
                  {errors.oldPassword ||
                    errors.newPassword ||
                    errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="field">
              <button
                type="submit"
                className="button is-success"
                disabled={
                  isSubmitting ||
                  !!errors.oldPassword ||
                  !!errors.newPassword ||
                  !!errors.confirmPassword
                }
              >
                Update password
              </button>
            </div>
            {passwordSuccess && (
              <p className="notification is-success is-light">
                {passwordSuccess}
              </p>
            )}
          </Form>
        )}
      </Formik>

      <Formik
        initialValues={{
          password: "",
          newEmail: "",
          confirmEmail: "",
        }}
        validateOnMount
        onSubmit={({ password, newEmail, confirmEmail }, helpers) => {
          setEmailSuccess("");

          authService
            .changeEmail(password, newEmail, confirmEmail)
            .then(() => {
              helpers.resetForm();
              showSuccess(
                setEmailSuccess,
                "Email changed successfully. Please check your old email."
              );
            })
            .catch((err: AxiosError<ApiErrorResponse>) => {
              const data = err.response?.data;

              if (data?.errors) {
                Object.entries(data.errors).forEach(([field, message]) => {
                  helpers.setFieldError(field, message);
                });
                return;
              }

              if (data?.message) {
                if (data.message.toLowerCase().includes("email")) {
                  helpers.setFieldError("newEmail", data.message);
                } else if (data.message.toLowerCase().includes("password")) {
                  helpers.setFieldError("password", data.message);
                } else {
                  helpers.setFieldError("newEmail", data.message);
                }
                return;
              }

              helpers.setFieldError("newEmail", "Server error");
            })
            .finally(() => helpers.setSubmitting(false));
        }}
      >
        {({ touched, errors, values, isSubmitting }) => (
          <Form className="box">
            <h2 className="title is-5">Change email</h2>

            <div className="field">
              <div className="control">
                <Field
                  name="password"
                  type="password"
                  validate={validatePassword}
                  placeholder="Password"
                  className={cn("input", {
                    "is-danger": touched.password && errors.password,
                  })}
                />
              </div>
            </div>

            <div className="field">
              <div className="control">
                <Field
                  name="newEmail"
                  validate={validateEmail}
                  placeholder="New email"
                  className={cn("input", {
                    "is-danger": touched.newEmail && errors.newEmail,
                  })}
                />
              </div>
            </div>

            <div className="field">
              <div className="control">
                <Field
                  name="confirmEmail"
                  validate={(value: string) =>
                    value !== values.newEmail
                      ? "Emails do not match"
                      : undefined
                  }
                  placeholder="Confirm new email"
                  className={cn("input", {
                    "is-danger": touched.confirmEmail && errors.confirmEmail,
                  })}
                />
              </div>
            </div>

            <div className="field">
              <button
                type="submit"
                className="button is-success"
                disabled={
                  isSubmitting ||
                  !!errors.password ||
                  !!errors.newEmail ||
                  !!errors.confirmEmail
                }
              >
                Change email
              </button>
            </div>
            {emailSuccess && (
              <p className="notification is-success is-light">{emailSuccess}</p>
            )}
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </div>
  );
};
