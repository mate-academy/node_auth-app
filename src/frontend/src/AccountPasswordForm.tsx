import { useState, type FormEvent } from 'react';
import { changePassword, type ApiError } from './api';
import {
  accountActionsStyle,
  accountErrorListStyle,
  accountErrorTextStyle,
  accountFormStyle,
  accountInputStyle,
} from './accountFormStyles';
import {
  validateNewPassword,
  validateOldPassword,
  validatePasswordConfirmation,
} from './accountValidation';

type AccountPasswordFormProps = {
  requiresCurrentPassword: boolean;
  onCancel: () => void;
  onClearPageMessages: () => void;
  onSuccess: (message: string) => void;
};

export function AccountPasswordForm({
  requiresCurrentPassword,
  onCancel,
  onClearPageMessages,
  onSuccess,
}: AccountPasswordFormProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const currentPasswordErrors = [
    ...validateOldPassword(oldPassword, requiresCurrentPassword),
    ...(serverErrors.oldPassword ? [serverErrors.oldPassword] : []),
  ];
  const nextPasswordErrors = [
    ...validateNewPassword(newPassword),
    ...(serverErrors.newPassword ? [serverErrors.newPassword] : []),
  ];
  const confirmPasswordErrors = [
    ...validatePasswordConfirmation(newPassword, confirmNewPassword),
  ];
  const hasClientErrors =
    validateOldPassword(oldPassword, requiresCurrentPassword).length > 0 ||
    validateNewPassword(newPassword).length > 0 ||
    validatePasswordConfirmation(newPassword, confirmNewPassword).length > 0;

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
      const { message } = await changePassword({ oldPassword, newPassword });
      onSuccess(message);
    } catch (err) {
      const apiError = err as ApiError;
      setServerErrors(apiError?.errors ?? {});
      setServerMessage(apiError?.message ?? 'Could not change your password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={accountFormStyle}>
      <h3 style={{ margin: 0 }}>
        {requiresCurrentPassword ? 'Change password' : 'Set password'}
      </h3>

      {requiresCurrentPassword && (
        <>
          <input
            type="password"
            placeholder="Old password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
            style={{
              ...accountInputStyle,
              borderColor:
                submitted && currentPasswordErrors.length > 0
                  ? '#c00'
                  : undefined,
            }}
          />

          {submitted && currentPasswordErrors.length > 0 && (
            <ul style={accountErrorListStyle}>
              {currentPasswordErrors.map(passwordError => (
                <li key={passwordError}>{passwordError}</li>
              ))}
            </ul>
          )}
        </>
      )}

      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
        style={{
          ...accountInputStyle,
          borderColor:
            submitted && nextPasswordErrors.length > 0 ? '#c00' : undefined,
        }}
      />

      {submitted && nextPasswordErrors.length > 0 && (
        <ul style={accountErrorListStyle}>
          {nextPasswordErrors.map(passwordError => (
            <li key={passwordError}>{passwordError}</li>
          ))}
        </ul>
      )}

      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmNewPassword}
        onChange={e => setConfirmNewPassword(e.target.value)}
        required
        style={{
          ...accountInputStyle,
          borderColor:
            submitted && confirmPasswordErrors.length > 0 ? '#c00' : undefined,
        }}
      />

      {submitted && confirmPasswordErrors.length > 0 && (
        <ul style={accountErrorListStyle}>
          {confirmPasswordErrors.map(passwordError => (
            <li key={passwordError}>{passwordError}</li>
          ))}
        </ul>
      )}

      {serverMessage && Object.keys(serverErrors).length === 0 && (
        <p style={accountErrorTextStyle}>{serverMessage}</p>
      )}

      <div style={accountActionsStyle}>
        <button className="app-button" type="submit" disabled={submitting}>
          {submitting
            ? 'Saving password...'
            : requiresCurrentPassword
              ? 'Save new password'
              : 'Save password'}
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
