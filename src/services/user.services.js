import { User } from '../models/User.model.js';

const registerUser = (name, email, password, activationToken) => {
  return User.create({
    name,
    email,
    password,
    activationToken,
  });
};

const findUser = (email) => {
  return User.findOne({ where: { email } });
};

const findUserById = (id) => {
  return User.findByPk(id);
};

const updateNameService = async (id, name) => {
  const user = await findUserById(id);

  if (!user) {
    return null;
  }

  user.name = name;
  await user.save();

  return user;
};

const normilizeUser = (user) => {
  return {
    userId: user.userId,
    email: user.email,
    name: user.name,
  };
};

export const userServices = {
  registerUser,
  findUser,
  findUserById,
  updateNameService,
  normilizeUser,
};
