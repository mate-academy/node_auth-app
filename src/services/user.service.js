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

export const getByActivationToken = async (activationToken) => {
  return User.findOne({ where: { activationToken } });
};

export const create = async ({
  // eslint-disable-next-line no-shadow
  name,
  email,
  passwordHash,
  activationToken,
}) => {
  return User.create({
    name,
    email,
    passwordHash,
    activationToken,
  });
};

export const update = async (id, data) => {
  const user = await User.findByPk(id);

  if (!user) {
    return null;
  }

  return user.update(data);
};
