import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    throw new Error('User with this email already exists.');
  }

  const safePassword = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT_ROUNDS),
  );

  const newUser = await User.create({ name, email, password: safePassword });

  return newUser;
};

export const AuthService = {
  register,
};
