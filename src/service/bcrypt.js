import bcrypt from 'bcrypt';

const isPasswordCorrect = (currentPassword, hashedPassword) => {
  return bcrypt.compare(currentPassword, hashedPassword);
};

const hashPassword = (password) => bcrypt.hash(password, 10);

export const bcryptService = {
  isPasswordCorrect,
  hashPassword,
};
