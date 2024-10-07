import { ApiError } from '../exceptions/api.error.js';
import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service.js';
import { authController } from './auth.controller.js';
import bcrypt from 'bcrypt';

const getProfile = async (req, res) => {
  const { email } = req.user;
  const user = await userService.getUserActivated(email);

  res.send(userService.normalize(user));
};

const changeUserName = async (req, res) => {
  const { email } = req.user;
  const { newName } = req.body;

  if (!newName) {
    throw ApiError.BadRequest('Name is required');
  }

  const user = await userService.getUserActivated(email);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  user.name = newName;
  await user.save();

  res
    .status(200)
    .send({ message: `Name successfully changed to ${user.name}` });
};

const changeUserEmail = async (req, res) => {
  const { password, newEmail, confirmNewEmail } = req.body;

  if (!password || !newEmail || !confirmNewEmail) {
    throw ApiError.BadRequest('All fields are required');
  }

  const isNotValidNewEmail = authController.validateEmail(newEmail);

  if (isNotValidNewEmail) {
    throw ApiError.BadRequest('Invalid email format');
  }

  if (newEmail !== confirmNewEmail) {
    throw ApiError.BadRequest('New email and confirmation email do not match');
  }

  const user = await userService.getUserActivated(req.user.email);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Invalid old password');
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  emailService.send({
    email: oldEmail,
    subject: 'Email changed',
    html: `
      <h1>Email successfully changed</h1>
      <p>Your new email is ${newEmail}</p>
    `,
  });

  res.status(200).send({
    message: `Email successfully changed.
      A notification has been sent to your old email.`,
  });
};

const changeUserPass = async (req, res) => {
  const { email } = req.user;
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const isNewPasswordNotValid = authController.validatePassword(newPassword);

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    throw ApiError.BadRequest('All fields are required');
  }

  if (isNewPasswordNotValid) {
    throw ApiError.BadRequest('New password must meet the required criteria', {
      newPassword: isNewPasswordNotValid,
    });
  }

  if (newPassword !== confirmNewPassword) {
    throw ApiError.BadRequest('Passwords do not match');
  }

  const user = await userService.getUserActivated(email);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw ApiError.BadRequest('Invalid old password');
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedPass;
  await user.save();

  res.status(200).send({ message: 'Ok, password was changed successfully' });
};

export const profileController = {
  getProfile,
  changeUserName,
  changeUserEmail,
  changeUserPass,
};
