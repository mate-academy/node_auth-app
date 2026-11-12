import { useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import { ChangeNameForm } from '../components/ChangeNameForm';
import { ChangeEmailForm } from '../components/ChangeEmailForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';

export const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h1 className="title">Profile information</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <ChangeNameForm />
      <ChangeEmailForm />
      <ChangePasswordForm />
    </>
  );
};
