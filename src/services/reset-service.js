const { ApiError } = require('../exceptions/API-error.js');
const { User } = require('../models/user.model.js');

const resetService = {
  async saveToken(user, resetToken) {
    const currentResetToken = user.resetToken;

    if (currentResetToken) {
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

module.exports = {
  resetService,
};
