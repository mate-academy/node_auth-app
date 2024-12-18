// const { ApiError } = require('../exceptions/ApiError');
const { User } = require('../models/user');
const { hashPassword } = require('../utils/password/hashPassword');

const getUsers = async () => {
  const users = await User.findAll();

  return users;
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });

  return user;
};

const getUsersById = async (id) => {
  const user = await User.findOne({ where: { id } });

  return user;
};

const removeUser = async (id) => {
  await User.destroy({ where: { id } });
};

const updateUser = async (user, userData) => {
  Object.entries(userData).forEach(async ([field, data]) => {
    if (data && field === 'password') {
      user[field] = await hashPassword(data);
    } else if (data) {
      user[field] = data;
    }
  });

  await user.save();

  const updatedUser = await getUsersById(user.id);

  return updatedUser;
};

module.exports = {
  usersServices: {
    getUsers,
    getUsersById,
    removeUser,
    getUserByEmail,
    updateUser,
  },
};
