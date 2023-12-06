import React, { useEffect, useMemo, useState } from 'react';
import { User } from '../types/User';
import { UserContext } from '../types/UserContext';
import { getAuthUser, logout } from '../api/user';

const initialContext: UserContext = {
  user: null,
  onSetUser: () => {},
  onLogOutUser: () => {},
};

export const AuthContext = React.createContext(initialContext);

type Props = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const IsLogin = async () => {
      try {
        const user = await getAuthUser();

        setUser(user);

        console.log('is logged');
      } catch (error) {
        console.log('isnt logged');
      }
    };

    IsLogin();
  }, []);

  const onSetUser = (user: null | User): void => {
    setUser(user);
  };

  const onLogOutUser = () => {
    logout();
    onSetUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      onSetUser,
      onLogOutUser,
    }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
