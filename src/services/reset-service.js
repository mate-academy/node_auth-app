import { ApiError } from '../exceptions/API-error.js';
import { User } from '../models/user.model.js';

export const resetService = {
  async saveToken(user, resetToken) {
    // If user already has a resetToken -> Don't change it
    const currentResetToken = user.resetToken;

    if (!!currentResetToken) {
      throw ApiError.BadRequest('User already has a password reset token.');
    }

    user.resetToken = resetToken;
    await user.save();
  },

  async deleteResetTokenByUserId(userId) {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      throw ApiError.NotFound();
    }

    user.resetToken = null;
    await user.save();
  },
};
