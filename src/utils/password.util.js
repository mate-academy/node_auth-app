import bcrypt from 'bcrypt';
import 'dotenv/config';

const getHashedPassword = async (password) => {
  const saltRounds = Number(process.env.PASSWORD_SALT);
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return hashedPassword;
};

const comparePassword = async ({ hashedPassword, password }) => {
  const isEqual = await bcrypt.compare(password, hashedPassword);

  return isEqual;
};

export const passwordUtils = {
  getHashedPassword,
  comparePassword,
};
