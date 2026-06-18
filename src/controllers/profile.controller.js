import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../exeptions/api.error.js';
import { userService } from '../services/user.service.js';
import { emailService } from '../services/email.service.js';
import { User } from '../models/user.js';

const getData = async (req, res) => {
  const user = await userService.findByEmail(req.user.email);

  res.status(200).send(userService.profileNormalize(user));
};

const changeName = async (req, res) => {
  const { name } = req.body;
  const user = await userService.findByEmail(req.user.email);

  if (!user) {
    throw ApiError.unAuthorized();
  }

  user.name = name;
  await user.save();

  res.status(200).send(userService.profileNormalize(user));
};

const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmedPassword } = req.body;

  const user = await userService.findByEmail(req.user.email);
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!oldPassword || !newPassword || !confirmedPassword) {
    return next(ApiError.badRequest('All password fields are required'));
  }

  if (!isPasswordValid) {
    return next(ApiError.badRequest('Old password is not correct'));
  }

  if (newPassword !== confirmedPassword) {
    return next(ApiError.badRequest('New passwords do not match'));
  }

  if (newPassword === oldPassword) {
    return next(
      ApiError.badRequest('New password must be different from old password'),
    );
  }

  const password = await bcrypt.hash(newPassword, 10);

  user.password = password;
  await user.save();

  res.status(200).send('Password changed');
};

const changeEmail = async (req, res, next) => {
  const { password, newEmail } = req.body;

  if (!password || !newEmail) {
    return next(ApiError.badRequest('Password and new email are required'));
  }

  if (newEmail === req.user.email) {
    return next(
      ApiError.badRequest('New email must be different from the current one'),
    );
  }

  const existingUser = await userService.findByEmail(newEmail);

  if (existingUser) {
    return next(ApiError.badRequest('This email is already in use'));
  }

  const user = await userService.findByEmail(req.user.email);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(
      ApiError.badRequest({ oldPassword: 'Password is not correct' }),
    );
  }

  const confirmToken = uuidv4();
  const TTL = new Date(Date.now() + 1 * 60 * 60 * 1000);

  user.confirmToken = confirmToken;
  user.confirmTokenExpiry = TTL;
  user.pendingEmail = newEmail;
  await user.save();

  await emailService.sendConfirmEmail(newEmail, confirmToken);

  res.status(200).send('Confirmation email sent');
};

const confirmEmail = async (req, res, next) => {
  const { confirmToken } = req.params;

  const user = await User.findOne({ where: { confirmToken } });

  if (!user) {
    throw ApiError.notFound({
      message: 'Invalid or non-existent confirmation token',
    });
  }

  if (user.confirmTokenExpiry < new Date()) {
    user.confirmToken = null;
    user.confirmTokenExpiry = null;
    user.pendingEmail = null;
    await user.save();

    return next(ApiError.badRequest({ message: 'Token expired' }));
  }

  const oldEmail = user.email;

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.confirmToken = null;
  user.confirmTokenExpiry = null;
  await user.save();

  await emailService.sendEmailChanged(oldEmail, user.email);

  res.status(200).send('Email changed');
};

export const profileController = {
  getData,
  changeName,
  changePassword,
  changeEmail,
  confirmEmail,
};
