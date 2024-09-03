const { User } = require('../models/User.model');

const hashService = require('../services/hash.service');

const normalize = ({ id, name, email, password }) => ({
  id,
  name,
  email,
  password,
});

const findByEmail = (email) => {
  return User.findOne({
    where: {
      email,
    },
  });
};

const getById = (userId) => {
  return User.findOne({
    where: {
      id: userId,
    },
  });
};

const activate = async (token) => {
  const user = await User.findOne({
    where: {
      activationToken: token,
    },
  });

  if (!user) {
    return false;
  }

  // eslint-disable-next-line no-console
  console.log(`Activated: ${user.name}`);

  user.activationToken = null;
  await user.save();

  return true;
};

const activateNewEmail = async (token) => {
  const user = await User.findOne({
    where: {
      emailChangeToken: token,
    },
  });

  if (!user) {
    return false;
  }

  // eslint-disable-next-line no-console
  console.log(`Activated: ${user.name}`);

  user.email = user.newEmail;
  user.emailChangeToken = null;
  user.newEmail = null;

  await user.save();

  return true;
};

const getByResetToken = async (token) => {
  return User.findOne({
    where: {
      resetToken: token,
    },
  });
};

const changePassword = async (userId, newPassword) => {
  if (!userId || !newPassword) {
    return;
  }

  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    return;
  }

  const hashedPassword = await hashService.hashPassword(newPassword);

  user.hashedPassword = hashedPassword;
  user.save();
};

module.exports = {
  normalize,
  findByEmail,
  getById,
  activate,
  activateNewEmail,
  getByResetToken,
  changePassword,
};
