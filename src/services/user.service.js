import { User } from '../models/user.model.js';

const getByEmail = (email) => {
  return User.findAll({ where: { email } });
};

const create = (email, password) => {
  return User.create({ email, password });
};

export const userService = {
  create,
  getByEmail,
};
