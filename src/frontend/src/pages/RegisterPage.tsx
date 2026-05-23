import { useState } from 'react';
import type { FormErrors } from '../types/FormErrors.ts';
import { register } from '../api/auth.ts';
import { validateValues } from '../utils/validateValues.ts';
import { Loader } from './components/Loader.tsx';
import { Info } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    email: '',
    password: '',
  });
  const [serverError, setServerError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (registered) {
    return (
      <section className="registered">
        <h2>Check your email</h2>
        <p>We have sent you an email with the activation link</p>
      </section>
    );
  }

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      setServerError('');

      await register({
        name,
        email,
        password,
      });

      setName('');
      setEmail('');
      setPassword('');

      return true;
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    const newErrors: FormErrors = {
      name: validateValues.name(name),
      email: validateValues.email(email),
      password: validateValues.password(password),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error);

    if (hasErrors) {
      return;
    }

    const success = await handleRegister();
    if (success) {
      setRegistered(true);
    }
  };

  return (
    <div
      className={`form-wrapper background-white ${serverError ? 'form-wrapper-danger' : ''}`}
    >
      <h2 className="title">Sign up</h2>
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="input-container">
          <label htmlFor="name">
            <strong>Name</strong>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`form-input ${errors.name ? 'input-error' : ''}`}
            placeholder="Enter your name"
          />
          {errors.name && <p className="notification">{errors.name}</p>}
        </div>
        <div className="input-container">
          <label htmlFor="email">
            <strong>Email</strong>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`form-input ${errors.email ? 'input-error' : ''}`}
            placeholder="Enter your email"
          />
          {errors.email && <p className="notification">{errors.email}</p>}
        </div>
        <div className="input-container">
          <div className="password-icon-container">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <a className="my-anchor-element">{<Info size={20}/>}</a>
            <Tooltip anchorSelect=".my-anchor-element" place="top">
              Password must be at least 6 characters long
            </Tooltip>
          </div>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`form-input ${errors.password ? 'input-error' : ''}`}
            placeholder="Enter your password"
          />
          {errors.password && <p className="notification">{errors.password}</p>}
          {isLoading ? (
            <Loader />
          ) : (
            <p className="notification">{serverError}</p>
          )}
        </div>
        <div className="button-error-container">
          <button type="submit" className="form-button">
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};
