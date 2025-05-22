import { createContext, Dispatch } from 'react';
import { User } from '../types';

type UserContext = {
  user: User | null;
  setUser: Dispatch<React.SetStateAction<User | null>>;
};

export const UserContext = createContext<UserContext>({
  user: null,
  setUser: () => {},
});
