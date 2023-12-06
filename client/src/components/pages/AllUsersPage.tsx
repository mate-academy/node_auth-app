import React, { useEffect, useState } from 'react';
import { User } from '../../types/User';
import { getAllUsers } from '../../api/user';
import { Loader } from '../Loader';
import { useNavigate } from 'react-router-dom';

export const AllUsersPage = () => {
  const [users, setUsers] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);

        const users = await getAllUsers();
        setUsers(users);
      } catch (error) {
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  console.log(users);

  if (isLoading) {
    return <Loader />;
  }

  return users ? (
    <>
      <h1 className="title is-1">Users list</h1>
      {users.map((user) => {
        return (
          <h4 className="title is-3" key={user.id}>
            {user.name}
          </h4>
        );
      })}
    </>
  ) : (
    <h1 className="title is-1">No users data</h1>
  );
};
