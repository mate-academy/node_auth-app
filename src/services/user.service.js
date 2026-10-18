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

export const create = async ({ name, email, passwordHash }) => {
  return User.create({ name, email, passwordHash });
};

export const update = async (id, data) => {
  const user = await User.findByPk(id);

  if (!user) {
    return null;
  }

  return user.update(data);
};
