// const { ApiError } = require('../exceptions/ApiError');
const { User } = require('../models/user');

const getUsers = async () => {
  const users = await User.findAll();

  return users;
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });

  return user;
};

const getUsersByID = async (id) => {
  const user = await User.findOne({ where: { id } });

  return user;
};

const removeUser = async (id) => {
  await User.destroy({ where: { id } });
};

module.exports = {
  usersServices: {
    getUsers,
    getUsersByID,
    removeUser,
    getUserByEmail,
  },
};
