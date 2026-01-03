import { User } from '../models/User.model.js';

async function registerUser(name, email, password, activationToken) {
  const user = await findUser(email);

  if (user) {
    throw new Error('User already exists');
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });
}

const findUser = async (email) => {
  const user = await User.findOne({
    where: {
      email,
    },
  });

  return user;
};

const findUserById = async (userId) => {
  const user = await User.findOne({
    where: {
      userId,
    },
  });

  return user;
};

function normilizeUser(user) {
  return {
    userId: user.userId,
    email: user.email,
  };
}

const updateNameService = (id, name) =>
  User.update({ name }, { where: { userId: id } });

const updateEmailService = (id, email) =>
  User.update({ email }, { where: { userId: id } });

const updatePasswordService = (id, password) =>
  User.update({ password }, { where: { userId: id } });

export const userServices = {
  registerUser,
  findUser,
  normilizeUser,
  findUserById,
  updateNameService,
  updateEmailService,
  updatePasswordService,
};
