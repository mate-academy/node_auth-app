import React, { useEffect, useState, useMemo } from 'react';
import { usePageError } from '../hooks/usePageError';
import { userService } from '../services/userService';
import { User } from '../types/user';
import { AxiosError } from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Loader } from '../components/Loader';

export const UsersPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = usePageError('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getAll()
      .then(setUsers)
      .catch(async (error: AxiosError) => {
        if (!error.response) {
          setError('Network error, please try again.');
          return;
        }

        switch (error.response.status) {
          case 401:
            await logout();
            navigate('/login', { state: { from: location }, replace: true });
            break;
          case 403:
            setError('You do not have permission to view this.');
            break;
          case 500:
            setError('Server error, please contact support.');
            break;
          default: {
            const data = error.response.data as { message?: string };
            setError(data.message || 'An unexpected error occurred.');
            break;
          }
        }
      })
      .finally(() => setLoading(false));
  }, [logout, navigate, location, setError]);

  const usersList = useMemo(
    () => (
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    ),
    [users],
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="content">
      <h1 className="title">Users</h1>
      {usersList}
      {error && <p className="notification is-danger is-light">{error}</p>}
    </div>
  );
};
