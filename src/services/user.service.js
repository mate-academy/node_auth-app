import { User } from '../model/user.model.js';

export const getAll = async () => {
  return User.findAll();
};

export const getById = async (id) => {
  return User.findByPk(id);
};

export const getByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

export const create = async ({ name, email, password }) => {
  return User.create({ name, email, password });
};

export const update = async (id, data) => {
  const user = User.findByPk(id);

  if (!user) {
    return null;
  }

  return user.update(data);
};
