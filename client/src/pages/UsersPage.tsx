import { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types/user';
import type { AxiosError } from 'axios';
import { useAuth } from '../components/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export const UsersPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    userService
      .getAll()
      .then(setUsers)
      .catch(async (error: AxiosError) => {
        if (error.response?.status !== 401) {
          setError(error.message);
          return;
        }

        await logout();

        navigate('/login', {
          state: {
            from: location,
            replace: true,
          },
        });
      });
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Users
        </h1>

        <p className="mt-2 text-sm text-slate-500">List of registered users.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {users.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-1 px-6 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                </div>

                <span className="text-xs font-medium text-slate-400">
                  ID: {user.id}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-slate-700">No users found</p>
            <p className="mt-1 text-sm text-slate-400">
              There are currently no users to display.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
