import { Formik, Field, Form } from "formik";
import { toast } from "sonner";
import { userService } from "../services/userService";
import { validateEmail } from "../utils/validation";
import cn from 'classnames';
import { useAuth } from "./AuthContext";


type EmailChangeProps = {
  onDone: () => void;
};

export const EmailChange = ({ onDone }: EmailChangeProps) => {
  const { logout } = useAuth();

  return (
    <Formik
      initialValues={{
        newEmail: '',
        password: '',
        emailConfirmation: '',
      }}
      validate={({ newEmail, password, emailConfirmation }) => {
        const errors: {
          newEmail?: string;
          password?: string;
          emailConfirmation?: string;
        } = {};

        const emailError = validateEmail(newEmail);

        if (emailError) {
          errors.newEmail = emailError;
        }

        if (!password) {
          errors.password = 'Password is required';
        }

        if (!emailConfirmation) {
          errors.emailConfirmation = 'Please confirm your new email';
        } else if (newEmail !== emailConfirmation) {
          errors.emailConfirmation = 'Email addresses do not match';
        }

        return errors;
      }}
      onSubmit={({ newEmail, password, emailConfirmation }) => {
        return userService
          .updateEmail(newEmail, password, emailConfirmation)
          .then(() => {
            toast.success('Email successfully updated');
            onDone();
            setTimeout(logout, 2500);
          })
          .catch((error) => {
            const message = error.response?.data?.message;
            toast.error(message || 'Failed to update email');
          });
      }}
    >
      {({ touched, errors, isSubmitting }) => (
        <Form className="box">
          <div className="field">
            <label className="label" htmlFor="newEmail">
              New email
            </label>

            <Field
              name="newEmail"
              type="email"
              id="newEmail"
              className={cn('input', {
                'is-danger': touched.newEmail && errors.newEmail,
              })}
              disabled={isSubmitting}
            />

            {touched.newEmail && errors.newEmail && (
              <p className="help is-danger">{errors.newEmail}</p>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              Password
            </label>

            <Field
              name="password"
              type="password"
              id="password"
              className={cn('input', {
                'is-danger': touched.password && errors.password,
              })}
              disabled={isSubmitting}
            />

            {touched.password && errors.password && (
              <p className="help is-danger">{errors.password}</p>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor="emailConfirmation">
              Confirm new email
            </label>

            <Field
              name="emailConfirmation"
              type="email"
              id="emailConfirmation"
              className={cn('input', {
                'is-danger': touched.emailConfirmation && errors.emailConfirmation,
              })}
              disabled={isSubmitting}
            />

            {touched.emailConfirmation && errors.emailConfirmation && (
              <p className="help is-danger">{errors.emailConfirmation}</p>
            )}
          </div>

          <div className="field is-grouped">
            <button
              type="submit"
              className={cn('button is-success', {
                'is-loading': isSubmitting,
              })}
              disabled={isSubmitting}
            >
              Update email
            </button>

            <button
              type="button"
              className="button is-light"
              onClick={onDone}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
