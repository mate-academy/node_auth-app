import type { User } from '@prisma/client';

const normalize = ({ id, name, email }: User) => {
  return { id, name, email };
};

export type NormalizedUser = ReturnType<typeof normalize>;

export const userService = {
  normalize,
};
