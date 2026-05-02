import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateTokens = (user) => {
  const access = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  return { access };
};

export const register = async (email, password, name) => {
  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hash,
    name,
  });

  return user;
};

export const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    throw new Error('Please activate your email');
  }

  return generateTokens(user);
};
