const { User } = require('../models/users.model');
const bcrypt = require('bcrypt');

const createUser = async (email, password, activationToken) => {
  if (!email || !password) {
    throw new Error('Invalid input value');
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return User.create({ email, password: hashedPassword, activationToken });
};

const getByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const activate = async (email) => {
  await User.update(
    { activationToken: null },
    {
      where: { email },
    },
  );
};

const getAllActive = async () => {
  return User.findAll({ where: { activationToken: null } });
};

const UsersServices = {
  createUser,
  getByEmail,
  activate,
  getAllActive,
};

module.exports = {
  UsersServices,
};
