const { Token } = require('../models/token');

const getToken = async (userId) => {
  const token = await Token.findOne({ where: { userId } });

  return token;
};

const saveToken = async (userId, refreshToken) => {
  const token = await getToken(userId);

  if (!token) {
    return Token.create({ userId, refreshToken });
  }

  token.refreshToken = refreshToken;
  token.save();
};

const removeToken = async (refreshToken) => {
  await Token.destroy({ where: { refreshToken } });
};

module.exports = {
  tokenServices: {
    saveToken,
    getToken,
    removeToken,
  },
};
