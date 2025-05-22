import { useState } from 'react';
import { User } from '../types';
import { UserContext } from './UserContext';

type Props = {
  children: React.ReactNode;
};

export const UserProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);

  // const login = (user: User) => {
  //   setUser(user);
  //   setIsUserLoggedIn(true);
  // };

  // const logout = () => {
  //   setUser(null);
  //   setIsUserLoggedIn(false);
  // };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
