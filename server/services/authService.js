import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
import {
  sendActivationEmail,
  sendConfirmNewEmail,
  sendEmailChangedNotification,
  sendResetPasswordEmail,
} from './emailService.js';
import ApiError from '../utils/ApiError.js';

const createAccessToken = (user) =>
  jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

const createRefreshToken = (user) =>
  jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

const wasAcceptedByProvider = (delivery, email) =>
  delivery.accepted.some(
    (address) => address.toLowerCase() === email.toLowerCase(),
  );

const getUserOrThrow = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({
    where: { [Op.or]: [{ email }, { pendingEmail: email }] },
  });

  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    activationToken: uuidv4(),
    isActive: false,
  });

  await sendActivationEmail(user.email, user.activationToken);

  return { message: 'User created', userId: user.id };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Please activate your email first');
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const activateUser = async (token) => {
  const user = await User.findOne({ where: { activationToken: token } });

  if (!user) {
    throw new ApiError(400, 'Invalid token');
  }

  user.isActive = true;
  user.activationToken = null;

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    message: 'Account activated successfully',
    accessToken,
    refreshToken,
  };
};

export const logoutUser = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findByPk(decoded.userId);

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  return { message: 'Logged out successfully' };
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return { message: 'Link has been sent' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  await sendResetPasswordEmail(user.email, resetToken);

  return { message: 'Link has been sent' };
};

export const resetUserPassword = async (token, password, confirmation) => {
  if (password !== confirmation) {
    throw new ApiError(400, 'Passwords do not match');
  }

  const user = await User.findOne({ where: { resetPasswordToken: token } });

  if (
    !user ||
    !user.resetPasswordExpires ||
    user.resetPasswordExpires < new Date()
  ) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.refreshToken = null;
  await user.save();

  return { message: 'Password reset successfully' };
};

export const refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findByPk(decoded.userId);

  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  return { accessToken: createAccessToken(user) };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email', 'isActive', 'pendingEmail'],
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return { user };
};

export const updateUserName = async (userId, name) => {
  const user = await getUserOrThrow(userId);

  user.name = name;
  await user.save();

  return {
    message: 'Name updated successfully',
    user: { id: user.id, name: user.name, email: user.email },
  };
};

export const updateUserPassword = async (
  userId,
  oldPassword,
  newPassword,
  confirmation,
) => {
  if (newPassword !== confirmation) {
    throw new ApiError(400, 'Passwords do not match');
  }

  const user = await getUserOrThrow(userId);

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    throw new ApiError(400, 'Old password is incorrect');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.tokenVersion += 1;
  user.refreshToken = null;
  await user.save();

  return { message: 'Password changed successfully' };
};

export const requestEmailChange = async (userId, password, newEmail) => {
  const user = await getUserOrThrow(userId);

  if (!(await bcrypt.compare(password, user.password))) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  if (user.email === newEmail) {
    throw new ApiError(
      400,
      'New email must be different from the current email',
    );
  }

  const emailInUse = await User.findOne({
    where: {
      [Op.or]: [{ email: newEmail }, { pendingEmail: newEmail }],
      id: { [Op.ne]: user.id },
    },
  });

  if (emailInUse) {
    throw new ApiError(409, 'This email is already in use');
  }

  const emailChangeToken = crypto.randomBytes(32).toString('hex');

  user.pendingEmail = newEmail;
  user.emailChangeToken = emailChangeToken;
  user.emailChangeExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const delivery = await sendConfirmNewEmail(newEmail, emailChangeToken);

  if (!wasAcceptedByProvider(delivery, newEmail)) {
    throw new ApiError(
      502,
      'Email provider did not accept the confirmation email',
    );
  }

  return { message: 'Confirmation email has been sent' };
};

export const confirmEmailChange = async (token) => {
  const user = await User.findOne({ where: { emailChangeToken: token } });

  if (
    !user ||
    !user.pendingEmail ||
    !user.emailChangeExpires ||
    user.emailChangeExpires < new Date()
  ) {
    throw new ApiError(400, 'Invalid or expired email change token');
  }

  const oldEmail = user.email;
  const newEmail = user.pendingEmail;

  user.email = newEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;
  user.emailChangeExpires = null;
  await user.save();

  let notification = null;

  try {
    const delivery = await sendEmailChangedNotification(oldEmail, newEmail);

    if (!wasAcceptedByProvider(delivery, oldEmail)) {
      notification =
        'The old-email notification was not accepted by the email provider';
    }
  } catch (error) {
    console.error('Failed to send email-changed notification:', error);
    notification = 'The old-email notification could not be sent';
  }

  return { message: 'Email changed successfully', notification };
};
