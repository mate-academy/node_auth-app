import { User } from '../models/user.model.js';

const getByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const create = (email, password, activationToken) => {
  return User.create({ email, password, activationToken });
};

export const userService = {
  create,
  getByEmail,
};
