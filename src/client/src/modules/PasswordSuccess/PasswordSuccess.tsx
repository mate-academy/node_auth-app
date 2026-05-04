import { Link, useLocation } from 'react-router-dom';
import './PasswordSuccess.css';

type SuccessMode = 'confirm' | 'request';

type SuccessLocationState = {
  mode?: SuccessMode;
};

const successContent: Record<
  SuccessMode,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  request: {
    eyebrow: 'Email sent',
    title: 'Check your email',
    description:
      'If an account with this email exists, we sent a password reset link. Open the letter and continue the flow from there.',
  },
  confirm: {
    eyebrow: 'Password updated',
    title: 'Your password was changed',
    description:
      'Your new password is active now. You can return to login and sign in with the updated credentials.',
  },
};

export const PasswordSuccess = () => {
  const location = useLocation();
  const state = (location.state ?? {}) as SuccessLocationState;
  const mode = state.mode === 'confirm' ? 'confirm' : 'request';
  const content = successContent[mode];

  return (
    <section className="password-success">
      <div className="password-success__card">
        <p className="password-success__eyebrow">{content.eyebrow}</p>
        <h1 className="password-success__title">{content.title}</h1>
        <p className="password-success__description">{content.description}</p>

        <Link className="password-success__link" to="/login">
          Go to login
        </Link>
      </div>
    </section>
  );
};
