import { User } from './User.model.js';

export const getAll = async (filters = {}) => {
  const users = await User.findAll({
    order: [['createdAt', 'DESC']],
    where: filters,
  });

  return users;
};

export const getOne = async (id) => {
  return await User.findOne({ where: { id } });
};

export const findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

export const create = async (user) => {
  const newUser = await User.create(user);

  return newUser;
};

export const update = async (id, user) => {
  await User.update(user, { where: { id } });

  const updatedUser = await User.findOne({ where: { id } });

  return updatedUser;
};

export const deleteById = async (id) => {
  const deletedUser = await User.destroy({ where: { id } });

  return deletedUser;
};

export const isValidParams = (params) => {
  if (!params) {
    return false;
  }

  const { name, email, password } = params;

  return Boolean(name && email && password);
};

export const normalize = ({ id, email, name, activationToken }) => {
  return { id, email, name, activationToken };
};
