import { v4 as uuidv4 } from 'uuid';
import { findByEmail } from './user.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from './email.service.js';
import { Op } from 'sequelize';

async function updateEmail(email, newEmail) {
  const emailToken = uuidv4();
  const emailExpiry = new Date(Date.now() + 1000 * 60 * 60);

  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Not found User');
  }

  await User.update(
    {
      pendingEmail: newEmail,
      emailChangeToken: emailToken,
      emailChangeTokenExpiry: emailExpiry,
    },
    {
      where: { email },
    },
  );

  await emailService.sendActivationEmail(
    email,
    emailToken,
    'profile/email',
    'Activate change Email',
  );

  await emailService.sendNotification(email, 'Your email change was requested');
}

async function confirmEmailChange(emailChangeToken) {
  const user = await User.findOne({
    where: {
      emailChangeToken,
      emailChangeTokenExpiry: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw ApiError.notFound('Invalid or expired token');
  }

  await user.update({
    email: user.pendingEmail,
    pendingEmail: null,
    emailChangeToken: null,
    emailChangeTokenExpiry: null,
  });

  return user;
}

export const profileService = {
  updateEmail,
  confirmEmailChange,
};
