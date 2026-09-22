import { useState } from 'react';

import { useAuth } from './AuthContext';
import { userService } from '../services/userService';

export const ChangeName = () => {
  const { currentUser, updateCurrentUser } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const normalizedName = name.trim();

    if (!normalizedName) {
      setError('Name is required');
      return;
    }

    try {
      setIsLoading(true);

      const updatedUser = await userService.updateProfile(normalizedName);

      updateCurrentUser(updatedUser);
      setSuccess('Name successfully updated');
    } catch {
      setError('Failed to update name');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Change name</h2>

        <p className="mt-1 text-sm text-slate-500">
          Update the name displayed on your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="profile-name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Name
          </label>

          <input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
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
          {isLoading ? 'Saving...' : 'Save name'}
        </button>
      </form>
    </section>
  );
};
