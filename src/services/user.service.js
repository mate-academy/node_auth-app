import { User } from '../data/user.js';
import nodeCrypto from 'crypto';

export const normalizeUser = (user) => {
  const plainUser = user?.get ? user.get({ plain: true }) : user;

  return {
    id: plainUser.id,
    name: plainUser.name,
    email: plainUser.email,
    isActive: plainUser.isActive,
  };
};

export const getAllUsers = async () => {
  const users = await User.findAll();

  return users.map((user) => normalizeUser(user));
};

export const createUser = async (name, email, passwordHash) => {
  const activationToken = nodeCrypto.randomBytes(32).toString('hex');
  const newUser = await User.create({
    name,
    email,
    passwordHash,
    activationToken,
    isActive: false,
  });

  return newUser;
};

export const activateByToken = async (token) => {
  const user = await User.findOne({ where: { activationToken: token } });

  if (!user) {
    return null;
  }

  user.isActive = true;
  user.activationToken = null;
  await user.save();

  return normalizeUser(user);
};

export const findByEmail = async (email) => {
  return User.findOne({ where: { email } });
};
