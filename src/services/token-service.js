import { ApiError } from '../exceptions/API-error.js';
import { Token } from '../models/token.model.js';
import { User } from '../models/user.model.js';

export const tokenService = {
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
