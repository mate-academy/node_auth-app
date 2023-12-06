import { User } from './User';

export interface UserContext {
  user: User | null;
  onSetUser: (user: User | null) => void;
  onLogOutUser: () => void;
}
