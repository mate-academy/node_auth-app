import { Token } from '../models/token.js';
import { User } from '../models/user.js';

const getByEmail = (email) => {
  return User.findOne({
    where: { email: email },
  });
};

const createUser = async (name, email, password, activationToken) => {
  const newUser = await User.create({
    name,
    email,
    password,
    activationToken,
  });

  return newUser;
};

const activate = async (email) => {
  await User.update(
    { activationToken: null },
    {
      where: { email },
    },
  );

  const updatedUser = await User.findOne({ where: { email } });

  return updatedUser;
};

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

const changePassword = async (userId, password) => {
  await User.update(
    { password },
    {
      where: {
        id: userId,
      },
    },
  );

  const updatedUser = await User.findOne({ where: { id: userId } });

  return updatedUser;
};

export const authService = {
  createUser,
  getByEmail,
  activate,
  normalize,
  changePassword,
};
