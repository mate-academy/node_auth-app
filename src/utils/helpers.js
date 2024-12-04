import bcrypt from 'bcrypt';

export const hashPassword = (password) => {
  const SALT_ROUNDS = 10;

  return bcrypt.hash(password, SALT_ROUNDS);
};
