import type { DBUser, DTOUser } from '../static/types/user.types.ts';

const usrDto = (usr: DBUser): DTOUser => {
  const { password, activated, createdAt, updatedAt, ...user } = usr;

  return user;
};

export { usrDto };
