import { useContext } from 'react';
import { AuthContext } from '../components/AuthContext.jsx';

export const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h1 className="title">Profile</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </>
  );
};
