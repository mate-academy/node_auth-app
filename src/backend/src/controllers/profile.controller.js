import { ApiError } from '../exeptions/api.error.js';
import { userService } from '../services/user.service.js';
import { validateValues } from '../utils/validateValues.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';

const changeName = async (req, res) => {
  const { newName } = req.body;

  const error = validateValues.name(newName);

  if (error) {
    throw ApiError.badRequest(error);
  }

  const user = await userService.findById(req.user.id);

  user.name = newName;
  await user.save();

  const normalizedUser = userService.normalizeData(user);

  res.statusCode = 200;
  res.send(normalizedUser);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const currentPasswordError = validateValues.password(currentPassword);
  const newPasswordError = validateValues.password(newPassword);

  if (currentPasswordError) {
    throw ApiError.badRequest(currentPasswordError);
  }

  if (newPasswordError) {
    throw ApiError.badRequest(newPasswordError);
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match!');
  }

  const user = await userService.findById(req.user.id);

  const isCurrentPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isCurrentPasswordCorrect) {
    throw ApiError.badRequest('Incorrect current password');
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = newHashedPassword;
  await user.save();

  await tokenService.generateTokens(res, user);
};

const requestEmailChange = async (req, res) => {
  const { newEmail, password } = req.body;

  const newEmailError = validateValues.email(newEmail);

  if (newEmailError) {
    throw ApiError.badRequest(newEmailError);
  }

  const user = await userService.findById(req.user.id);

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.badRequest('Incorrect password');
  }

  const isEmailExist = await userService.findByEmail(newEmail);

  if (isEmailExist) {
    throw ApiError.badRequest('This email address is already in use');
  }

  user.pendingEmail = newEmail;
  await user.save();

  await userService.sendEmailChangeLink(newEmail, user.email);

  res.send({ message: 'OK' });
};

const confirmEmailChange = async (req, res) => {
  const { emailChangeToken } = req.params;

  const user = await User.findOne({ where: { emailChangeToken } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const oldEmail = user.email;
  const newEmail = user.pendingEmail

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;
  await user.save();

  emailService.sendNotificationAboutEmailChange(oldEmail, newEmail);

  res.send({ message: 'Email changed successfully' });
};

export const profileController = {
  changeName,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
};
