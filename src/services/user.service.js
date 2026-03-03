import { User } from '../models/user.js';

async function getUserByEmail(email) {
  try {
    const user = await User.findOne({ where: { email } });

    return user;
  } catch (err) {
    throw err;
  }
}

async function addUser(email, password, activationToken = false, name) {
  const newUser = await User.create({
    email,
    password,
    activationToken,
    name,
  });

  return newUser;
}

async function getUserByToken(token) {
  const user = await User.findOne({
    where: {
      activationToken: token,
    },
  });

  return user;
}

async function getUserByResetToken(resetToken) {
  const user = await User.findOne({ where: { resetToken } });

  return user;
}

const normalizedUser = ({ id, email }) => {
  return {
    id,
    email,
  };
};

async function getById(userId) {
  const user = await User.findByPk(userId);

  return user;
}

export const userService = {
  getUserByEmail,
  addUser,
  normalizedUser,
  getUserByToken,
  getById,
  getUserByResetToken,
};
