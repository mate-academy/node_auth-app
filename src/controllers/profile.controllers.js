import { userService } from '../services/user.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../services/email.service.js';

async function changeName(req, res) {
  const { name } = req.body;
  const userId = req.user.id;

  await userService.updateUser(userId, { name: name });

  res.sendStatus(200);
}

async function changePassword(req, res) {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await userService.findById(userId);
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    throw ApiError.badRequest('Old password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userService.updatePassword(userId, hashedPassword);

  res.sendStatus(200);
}

async function changeEmail(req, res) {
  const { newEmail, password } = req.body;
  const userId = req.user.id;

  const user = await userService.findById(userId);
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw ApiError.badRequest('Password is incorrect');
  }

  const oldEmail = user.email;

  await userService.updateUser(userId, {
    email: newEmail,
    activationToken: uuidv4(),
  });

  await emailService.sendActivationEmail(newEmail, user.activationToken);

  await emailService.send({
    email: oldEmail,
    subject: 'Email changed',
    html: `<p>Your email was changed to ${newEmail}. If this wasn't you, contact support.</p>`,
  });

  res.sendStatus(200);
}

export const profileController = {
  changeName,
  changePassword,
  changeEmail,
};
