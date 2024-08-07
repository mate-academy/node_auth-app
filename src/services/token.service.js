const { ApiError } = require('../exceptions/api.error');
const { Token } = require('../models/Token');
const userService = require('./user.service');

const save = async (userId, refreshToken) => {
  const user = await userService.findById(userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken });

    return;
  }

  token.refreshToken = refreshToken;

  await token.save();
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const removeByUserId = (userId) => {
  return Token.destroy({ where: { userId } });
};

module.exports = {
  save,
  getByToken,
  removeByUserId,
};
