import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.js';
import { emailService } from './email.service.js';
import { ApiError } from '../exeptions/api.error.js';

async function reset(email) {
  const resetToken = uuidv4();
  const resetTokenExpiry = Date.now() + 1000 * 60 * 15;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;

  await user.save();

  await emailService.sendActivationEmail(email, resetToken, 'reset-password', {
    title: 'Reset Password',
  });
}

export const passwordResetService = {
  reset,
};
