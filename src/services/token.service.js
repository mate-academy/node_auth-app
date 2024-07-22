const { Token } = require('../models/token.js');

async function save(userId, newToken) {
  try {
    const token = await Token.findOne({ where: { userId } });

    if (!token) {
      await Token.create({ userId, refreshToken: newToken });

      return;
    }

    token.refreshToken = newToken;
    await token.save();
  } catch (err) {
    throw err;
  }
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

function remove(userId) {
  return Token.distroy({ where: { userId } });
}

const tokenService = {
  save,
  getByToken,
  remove,
};

module.exports = {
  tokenService,
};
