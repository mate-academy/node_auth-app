import { User } from '../models/user.js';

const findUserByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const createUser = async (name, email, password, activationToken) => {
  return User.create({
    name,
    email,
    password,
    activationToken,
  });
};

export const userService = {
  findUserByEmail,
  createUser,
};
