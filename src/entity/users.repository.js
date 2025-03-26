import { User } from '../models/User.model.js';

const create = async ({ name, email, password, activationToken }) => {
  return User.create({
    name,
    email,
    password,
    activationToken,
  });
};

const findByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const findById = async (id) => {
  return User.findOne({ where: { id } });
};

const activate = async (email) => {
  await User.update(
    {
      activationToken: null,
    },
    {
      where: { email },
    },
  );
};

export const usersRepository = {
  create,
  findByEmail,
  activate,
  findById,
};

export default usersRepository;
