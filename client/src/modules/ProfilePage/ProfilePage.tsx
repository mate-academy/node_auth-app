import { Card } from '../shared/components/Card';
import { useAuthDispatch } from '../shared/store/AuthContext';
import { ProfileEmailForm } from './components/ProfileEmailForm';
import { ProfileNameForm } from './components/ProfileNameForm';
import { ProfilePasswordForm } from './components/ProfilePasswordForm';

export const ProfilePage = () => {
  const { logout } = useAuthDispatch();
  return (
    <Card className="flex flex-col gap-4 ">
      <h2>Profile</h2>

      <Card>
        <ProfileEmailForm />
      </Card>
      <Card>
        <ProfileNameForm />
      </Card>
      <Card>
        <ProfilePasswordForm />
      </Card>
      <button
        className=" w-full bg-slate-800 rounded-2xl mb-2 py-3 hover:bg-slate-700 cursor-pointer"
        onClick={() => logout()}
      >
        Logout
      </button>
    </Card>
  );
};
