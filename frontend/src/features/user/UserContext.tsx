import { createContext } from 'react';
import { User } from '../types';

type UserContext = {
  user: User | null;
};

export const UserContext = createContext<UserContext>({
  user: null,
});
