const { ApiError } = require('../exceptions/API-error.js');
const { Token } = require('../models/token.model.js');
const { User } = require('../models/user.model.js');

const tokenService = {
  // Writing Tokens
  async saveToken(userId, refreshToken) {
    const token = await tokenService.getByToken(refreshToken);

    if (token !== null) {
      token.refreshToken = refreshToken;
      await token.save();
    } else {
      const user = await User.findOne({ where: { id: userId } });

      if (!user) {
        throw ApiError.NotFound();
      }

      // Save the token to the DB
      const tokenFromDB = await Token.create({
        refreshToken,
        UserId: userId,
      });

      return tokenFromDB;
    }
  },

  // Reading Tokens
  getByToken(refreshToken) {
    return Token.findOne({ where: { refreshToken } });
  },

  deleteTokenByUserId(userId) {
    return Token.destroy({ where: { UserId: userId } });
  },
};

module.exports = {
  tokenService,
};
