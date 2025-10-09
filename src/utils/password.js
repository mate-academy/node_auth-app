import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  const saltRounds = 10;

  return bcrypt.hash(password, saltRounds);
};

export const comparePasswords = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
