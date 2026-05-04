import { useState } from 'react';
import './Form.css';
import { AuthUser, AuthResponse, RegistrationResponse } from '../../types/auth';
import { client } from '../../utils/client';
import { NavLink } from 'react-router-dom';

type LoginMode = 'login' | 'registration';

type FormStatus = {
  type: 'error' | 'success';
  message: string;
};
type Props = {
  initialMode?: LoginMode;
  onLoginSuccess?: (user: AuthUser) => void;
};

const getFieldValue = (form: HTMLFormElement, fieldName: string) => {
  const formData = new FormData(form);
  return String(formData.get(fieldName) || '').trim();
};

export const Form = ({ initialMode = 'login', onLoginSuccess }: Props) => {
  const [formType, setFormType] = useState<LoginMode>(initialMode);
  const [status, setStatus] = useState<FormStatus | null>(null);
  const isLoginMode = formType === 'login';

  const clearCustomValidity = (form: HTMLFormElement) => {
    const inputs = form.querySelectorAll('input');

    inputs.forEach((input) => {
      input.setCustomValidity('');
    });
  };

  const loginValidate = (form: HTMLFormElement) => {
    const email = getFieldValue(form, 'email');
    const password = getFieldValue(form, 'password');

    if (!email || !password) {
      setStatus({
        type: 'error',
        message: 'Email and password are required.',
      });

      return false;
    }

    return true;
  };

  const registrationValidate = (form: HTMLFormElement) => {
    const name = getFieldValue(form, 'name');
    const password = getFieldValue(form, 'password');
    const passwordConfirm = getFieldValue(form, 'confirmPassword');

    if (name.length < 3) {
      setStatus({
        type: 'error',
        message: 'Name must contain at least 3 non-space characters.',
      });

      return false;
    }

    if (password !== passwordConfirm) {
      const confirmPasswordInput = form.elements.namedItem(
        'confirmPassword',
      ) as HTMLInputElement | null;

      confirmPasswordInput?.setCustomValidity('Passwords must match.');
      confirmPasswordInput?.reportValidity();
      confirmPasswordInput?.focus();

      setStatus({
        type: 'error',
        message: 'Passwords must match.',
      });

      return false;
    }

    return true;
  };

  const formSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    clearCustomValidity(form);
    setStatus(null);

    if (!form.checkValidity()) {
      form.reportValidity();

      return;
    }

    const isValid = isLoginMode
      ? loginValidate(form)
      : registrationValidate(form);

    if (!isValid) {
      return;
    }

    try {
      if (isLoginMode) {
        const response = await client.post<AuthResponse>('/login', {
          email: getFieldValue(form, 'email'),
          password: getFieldValue(form, 'password'),
        });

        setStatus({
          type: 'success',
          message: response.message,
        });
        onLoginSuccess?.(response.data);

        return;
      }

      const response = await client.post<RegistrationResponse>(
        '/registration',
        {
          name: getFieldValue(form, 'name'),
          email: getFieldValue(form, 'email'),
          password: getFieldValue(form, 'password'),
          confirmPassword: getFieldValue(form, 'confirmPassword'),
        },
      );

      setStatus({
        type: 'success',
        message: `${response.message} Open ${import.meta.env.VITE_CLIENT_URL}/activate/${response.data.activationToken} to activate your account.`,
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Request failed',
      });
    }
  };

  return (
    <section className="auth-form-section">
      <form className="auth-form" noValidate onSubmit={formSubmit}>
        <p className="auth-form__eyebrow">Account</p>
        <h1 className="auth-form__title">
          {isLoginMode ? 'Log in' : 'Create account'}
        </h1>
        <p className="auth-form__subtitle">
          {isLoginMode
            ? 'Enter your credentials to continue.'
            : 'Fill in your details to create a new account.'}
        </p>

        <div className="auth-form__fields">
          {!isLoginMode && (
            <label className="auth-form__field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                autoComplete="name"
                minLength={3}
                onInput={(event) => {
                  event.currentTarget.setCustomValidity('');
                  setStatus(null);
                }}
                required
              />
            </label>
          )}

          <label className="auth-form__field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              autoComplete="email"
              onInput={() => setStatus(null)}
              required
            />
          </label>

          <label className="auth-form__field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete={isLoginMode ? 'current-password' : 'new-password'}
              minLength={8}
              onInput={() => setStatus(null)}
              required
            />
          </label>

          {!isLoginMode && (
            <label className="auth-form__field">
              <span>Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repeat your password"
                autoComplete="new-password"
                minLength={8}
                onInput={(event) => {
                  event.currentTarget.setCustomValidity('');
                  setStatus(null);
                }}
                required
              />
            </label>
          )}
        </div>

        {status && (
          <p className={`auth-form__status auth-form__status--${status.type}`}>
            {status.message}
          </p>
        )}

        <button className="auth-form__submit" type="submit">
          {isLoginMode ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <button
        className="auth-form__toggle"
        type="button"
        onClick={() => {
          setStatus(null);
          setFormType(isLoginMode ? 'registration' : 'login');
        }}
      >
        {isLoginMode
          ? "Don't have an account? Sign up"
          : 'Already have an account? Log in'}
      </button>

      <NavLink className="auth-form__toggle" to={'/password-reset/request'}>
        Forget password
      </NavLink>
    </section>
  );
};
