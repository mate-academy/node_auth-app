import { useState, type FormEvent } from 'react';
import { changeEmail, type ApiError } from './api';
import {
  accountActionsStyle,
  accountErrorListStyle,
  accountErrorTextStyle,
  accountFormStyle,
  accountHelperTextStyle,
  accountInputStyle,
} from './accountFormStyles';
import {
  validateCurrentPassword,
  validateEmailConfirmation,
  validateNewEmail,
} from './accountValidation';

type AccountEmailFormProps = {
  onCancel: () => void;
  onClearPageMessages: () => void;
  onSuccess: (message: string) => void;
};

export function AccountEmailForm({
  onCancel,
  onClearPageMessages,
  onSuccess,
}: AccountEmailFormProps) {
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const currentPasswordErrors = [
    ...validateCurrentPassword(password),
    ...(serverErrors.password ? [serverErrors.password] : []),
  ];
  const nextEmailErrors = [
    ...validateNewEmail(newEmail),
    ...(serverErrors.newEmail ? [serverErrors.newEmail] : []),
  ];
  const confirmEmailErrors = [
    ...validateEmailConfirmation(newEmail, confirmNewEmail),
  ];
  const hasClientErrors =
    validateCurrentPassword(password).length > 0 ||
    validateNewEmail(newEmail).length > 0 ||
    validateEmailConfirmation(newEmail, confirmNewEmail).length > 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setServerErrors({});
    setServerMessage(null);
    onClearPageMessages();

    if (hasClientErrors) {
      return;
    }

    setSubmitting(true);

    try {
      const { message } = await changeEmail({
        password,
        newEmail: newEmail.trim(),
      });
      onSuccess(message);
    } catch (err) {
      const apiError = err as ApiError;
      setServerErrors(apiError?.errors ?? {});
      setServerMessage(apiError?.message ?? 'Could not change your email.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={accountFormStyle}>
      <h3 style={{ margin: 0 }}>Change email</h3>

      <input
        type="password"
        placeholder="Current password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{
          ...accountInputStyle,
          borderColor:
            submitted && currentPasswordErrors.length > 0 ? '#c00' : undefined,
        }}
      />

      {submitted && currentPasswordErrors.length > 0 && (
        <ul style={accountErrorListStyle}>
          {currentPasswordErrors.map(passwordError => (
            <li key={passwordError}>{passwordError}</li>
          ))}
        </ul>
      )}

      <input
        type="email"
        placeholder="New email"
        value={newEmail}
        onChange={e => setNewEmail(e.target.value)}
        required
        style={{
          ...accountInputStyle,
          borderColor: submitted && nextEmailErrors.length > 0 ? '#c00' : undefined,
        }}
      />

      {submitted && nextEmailErrors.length > 0 && (
        <ul style={accountErrorListStyle}>
          {nextEmailErrors.map(emailError => <li key={emailError}>{emailError}</li>)}
        </ul>
      )}

      <input
        type="email"
        placeholder="Confirm new email"
        value={confirmNewEmail}
        onChange={e => setConfirmNewEmail(e.target.value)}
        required
        style={{
          ...accountInputStyle,
          borderColor:
            submitted && confirmEmailErrors.length > 0 ? '#c00' : undefined,
        }}
      />

      {submitted && confirmEmailErrors.length > 0 && (
        <ul style={accountErrorListStyle}>
          {confirmEmailErrors.map(emailError => <li key={emailError}>{emailError}</li>)}
        </ul>
      )}

      {serverMessage && Object.keys(serverErrors).length === 0 && (
        <p style={accountErrorTextStyle}>{serverMessage}</p>
      )}

      <p style={accountHelperTextStyle}>
        We&apos;ll send a confirmation link to the new address and notify your
        current email after the change.
      </p>

      <div style={accountActionsStyle}>
        <button className="app-button" type="submit" disabled={submitting}>
          {submitting ? 'Sending confirmation...' : 'Send confirmation link'}
        </button>
        <button
          className="app-button"
          type="button"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
