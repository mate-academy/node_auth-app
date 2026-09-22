import { useState, type SubmitEvent } from 'react';
import { userService } from '../services/userService';

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmation) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmation) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);

      await userService.updatePassword(oldPassword, newPassword, confirmation);

      setSuccess('Password successfully changed');

      setOldPassword('');
      setNewPassword('');
      setConfirmation('');
    } catch (error: unknown) {
      const apiError = error as ApiError;

      setError(apiError.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Change password
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Use a strong password with at least 6 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="oldPassword"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Current password
          </label>

          <input
            id="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            New password
          </label>

          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="confirmation"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Confirm new password
          </label>

          <input
            id="confirmation"
            type="password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
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
          {isLoading ? 'Changing...' : 'Change password'}
        </button>
      </form>
    </section>
  );
};
