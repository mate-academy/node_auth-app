import { useEffect, useState } from 'react';
import { usePageError } from '../hooks/usePageError';
import { userService } from '../services/userService';
import { User } from '../types/user';
import { AxiosError } from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export const UsersPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = usePageError('');
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
    <div className="content">
      <h1 className="title">Users</h1>

      <ul>
        {users.map(user => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </div>
  );
};
