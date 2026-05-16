import type { User } from '../../generated/prisma/client.js';

export type NormalizedUser = {
  id: number;
  name: string;
  email: string;
  isActivated: boolean;
};

const normalize = (user: User): NormalizedUser => {
  const { id, name, email, isActivated } = user;

  return {
    id,
    name,
    email,
    isActivated,
  };
};

export const usersService = {
  normalize,
};
