import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../models/user.js';
import { ApiError } from '../exeptions/api.error.js';
import { validatePassword } from '../validators/auth.validator.js';

import { emailService } from './email.service.js';

const emailPasswordReset = async ({ email }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return;
  }

  const resetToken = uuidv4();

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);

  await user.save();

  await emailService.sendResetPasswordEmail(email, resetToken);
};

const confirmPasswordReset = async (resetToken, password, confirmation) => {
  const user = await User.findOne({
    where: { resetPasswordToken: resetToken },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid reset token');
  }

  const isExpired = Date.now() > user.resetPasswordExpires.getTime();

  if (isExpired) {
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    throw ApiError.badRequest('Reset token has expired');
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    throw ApiError.badRequest('Invalid password', {
      password: passwordError,
    });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();
};

export const passwordService = {
  emailPasswordReset,
  confirmPasswordReset,
};
