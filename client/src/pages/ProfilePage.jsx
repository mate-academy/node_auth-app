import { useContext } from 'react';
import { AuthContext } from '../components/AuthContext';

export const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h1 className="title">Profile information</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </>
  );
};
