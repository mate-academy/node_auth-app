const { Token } = require('../models/token');

const getToken = async (userId) => {
  const token = await Token.findOne({ where: { userId } });

  return token;
};

const saveToken = async (userId, refreshToken) => {
  const token = await getToken(userId);

  if (!token) {
    const expireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return Token.create({ userId, refreshToken, expireAt });
  }

  token.refreshToken = refreshToken;
  token.expireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await token.save();
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
