const { Token } = require('../models/token');

class TokenService {
  save = async (userId, newToken) => {
    const token = await Token.findOne({ where: { userId } });

    if (token) {
      await Token.create({ userId, refreshToken: newToken });

      return;
    }

    token.refreshToken = newToken;

    await token.save();
  };
  getByToken = (refreshToken) => Token.findOne({ where: { refreshToken } });
  remove = async (userId) => Token.destroy({ where: { userId } });
}

const tokenService = new TokenService();

module.exports = { tokenService };
