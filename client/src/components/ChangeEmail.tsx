import { useState } from 'react';

import { userService } from '../services/userService';
import type { ApiError } from './ChangePassword';

export const ChangeEmail = () => {
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const normalizedEmail = newEmail.trim().toLowerCase();

    if (!password || !normalizedEmail) {
      setError('Password and new email are required');
      return;
    }

    try {
      setIsLoading(true);

      const response = await userService.requestEmailChange(
        password,
        normalizedEmail,
      );

      setSuccess(response.message);

      setPassword('');
      setNewEmail('');
    } catch (error: unknown) {
      const apiError = error as ApiError;

      setError(
        apiError.response?.data?.message || 'Failed to request email change',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Change email</h2>

        <p className="mt-1 text-sm text-slate-500">
          Update the email address associated with your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="change-email-password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Current password
          </label>

          <input
            id="change-email-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="new-email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            New email
          </label>

          <input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Sending confirmation...' : 'Change email'}
        </button>
      </form>
    </section>
  );
};
