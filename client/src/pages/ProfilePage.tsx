import { useAuth } from '../components/AuthContext';
import { ChangeEmail } from '../components/ChangeEmail';
import { ChangeName } from '../components/ChangeName';
import { ChangePassword } from '../components/ChangePassword';

export const ProfilePage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your personal information and account security.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Account
        </p>

        <div className="mt-3">
          <p className="text-sm text-slate-500">Email address</p>
          <p className="mt-1 text-base font-medium text-slate-900">
            {currentUser?.email}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <ChangeName />
        <ChangePassword />
        <ChangeEmail />
      </div>
    </div>
  );
};
