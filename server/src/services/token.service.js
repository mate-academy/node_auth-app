const RefreshToken = require('../models/refreshToken.model.js');

const saveRefreshToken = async (userId, refreshToken) => {
  const existingToken = await RefreshToken.findOne({
    where: { UserId: userId },
  });

  if (existingToken) {
    existingToken.token = refreshToken;
    await existingToken.save();
  } else {
    await RefreshToken.create({ token: refreshToken, UserId: userId });
  }
};

const getRefreshToken = async (refreshToken) => {
  return RefreshToken.findOne({ where: { token: refreshToken } });
};

const removeRefreshToken = async (userId) => {
  return RefreshToken.destroy({ where: { UserId: userId } });
};

const tokenService = {
  saveRefreshToken,
  getRefreshToken,
  removeRefreshToken,
};

module.exports = { tokenService };
