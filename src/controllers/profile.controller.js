import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/User.js';
import { emailService } from '../services/email.service.js';

const updateName = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name || name.length < 2) {
    throw ApiError.badRequest('Name must be at least 2 characters long');
  }

  await User.update({ name }, { where: { id: userId } });

  res.send({ message: 'Name updated successfully!' });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!newPassword || newPassword.length < 6) {
    throw ApiError.badRequest('New password must be at least 6 characters');
  }

  const user = await User.findOne({ where: { id: userId } });

  const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordCorrect) {
    throw ApiError.badRequest('The old password is incorrect');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await User.update({ password: hashedNewPassword }, { where: { id: userId } });

  res.send({ message: 'Password updated successfully' });
};

const requestEmailChange = async (req, res) => {
  const { newEmail, password } = req.body;
  const userId = req.user.id;

  const user = await User.findOne({ where: { id: userId } });

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.badRequest('Wrong password');
  }

  const emailExists = await User.findOne({ where: { email: newEmail } });

  if (emailExists) {
    throw ApiError.badRequest('Someone is already using this email');
  }

  const token = uuidv4();

  await user.update({
    pendingEmail: newEmail,
    activationToken: token,
  });

  await emailService.send({
    email: user.email,
    subject: 'Security Alert: Email Change Request',
    html: `
      <h1>Email Change Initiated</h1>
      <p>A request was made to change your account email to: <strong>${newEmail}</strong>.</p>
      <p>If you did NOT request this, please change your password immediately.</p>
    `,
  });

  const confirmationLink = `${process.env.CLIENT_HOST}/confirm-email-change/${token}`;

  await emailService.send({
    email: newEmail,
    subject: 'Confirm your new email address',
    html: `
      <h1>Confirm your email change</h1>
      <p>Please click the link below to confirm that you want to use this email for your account:</p>
      <a href="${confirmationLink}">${confirmationLink}</a>
    `,
  });

  res.send({ message: 'Success! Confirmation link sent to your email.' });
};

export const profileController = {
  updateName,
  updatePassword,
  requestEmailChange,
};
