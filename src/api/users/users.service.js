import { User } from './User.model.js';

export const getAll = async () => {
  const users = await User.findAll({
    order: [['id', 'ASC']],
  });

  return users;
};

export const getOne = async (id) => {
  const user = await User.findOne({ where: { id } });

  return user;
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
