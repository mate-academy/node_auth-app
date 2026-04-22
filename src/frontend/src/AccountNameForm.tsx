import { useState, type FormEvent } from 'react';
import { changeName, type ApiError } from './api';
import {
  accountActionsStyle,
  accountErrorListStyle,
  accountErrorTextStyle,
  accountFormStyle,
  accountInputStyle,
} from './accountFormStyles';
import { validateNewName } from './accountValidation';

type AccountNameFormProps = {
  onCancel: () => void;
  onClearPageMessages: () => void;
  onSuccess: (message: string, nextName: string) => void;
};

export function AccountNameForm({
  onCancel,
  onClearPageMessages,
  onSuccess,
}: AccountNameFormProps) {
  const [newName, setNewName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const clientNameErrors = validateNewName(newName);
  const nameErrors = [
    ...clientNameErrors,
    ...(serverErrors.newName ? [serverErrors.newName] : []),
  ];
  const hasClientErrors = clientNameErrors.length > 0;

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
      const { message } = await changeName({ newName });
      onSuccess(message, newName.trim());
    } catch (err) {
      const apiError = err as ApiError;
      setServerErrors(apiError?.errors ?? {});
      setServerMessage(apiError?.message ?? 'Could not change your name.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={accountFormStyle}>
      <h3 style={{ margin: 0 }}>Change name</h3>

      <input
        type="text"
        placeholder="New name"
        value={newName}
        onChange={e => setNewName(e.target.value)}
        required
        style={{
          ...accountInputStyle,
          borderColor: submitted && nameErrors.length > 0 ? '#c00' : undefined,
        }}
      />

      {submitted && nameErrors.length > 0 && (
        <ul style={accountErrorListStyle}>
          {nameErrors.map(nameError => <li key={nameError}>{nameError}</li>)}
        </ul>
      )}

      {serverMessage && Object.keys(serverErrors).length === 0 && (
        <p style={accountErrorTextStyle}>{serverMessage}</p>
      )}

      <div style={accountActionsStyle}>
        <button className="app-button" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save new name'}
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
