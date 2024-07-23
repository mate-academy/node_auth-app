const { v4 } = require('uuid');
const { User } = require('../models/user.model.js');
const { ApiError } = require('../exceptions/API-error.js');

const getAllActiveUsers = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
    attributes: ['id', 'email'],
  });
};

const updateUserName = async (newName, userId) => {
  const user = await findActivatedUserById(userId);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  await user.update('name', newName);
};

const updateUserEmail = async (newEmail, userId) => {
  const user = await findActivatedUserById(userId);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  await user.update('email', newEmail);
};

const generateActivationToken = () => v4();

function findActivatedUserById(userId) {
  User.findOne({
    where: {
      id: userId,
      activationToken: null,
    },
  });
}

module.exports = {
  getAllActiveUsers,
  updateUserName,
  updateUserEmail,
  generateActivationToken,
};
