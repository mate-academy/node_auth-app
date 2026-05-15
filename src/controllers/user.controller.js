import { ApiError } from '../exeptions/api.error.js';
import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const user = await userService.findById(req.userId);

  if (!name) {
    throw ApiError.badRequest('Name cannot be empty');
  }
  user.name = name;
  await user.save();
  res.send(userService.normalize(user));
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('New passwords do not match');
  }

  const user = await userService.findById(req.userId);
  const isOldValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldValid) {
    throw ApiError.badRequest('Wrong old password');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({ message: 'Password changed successfully' });
};

const updateEmail = async (req, res) => {
  const { password, newEmail, newEmailConfirmation } = req.body;
  const user = await userService.findById(req.userId);

  if (newEmail !== newEmailConfirmation) {
    throw ApiError.badRequest('New emails do not match');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await emailService.sendEmailChangeNotification(
    oldEmail,
    `Your email was changed to ${newEmail}.`,
  );

  res.send(userService.normalize(user));
};

export const userController = {
  getAllActivated,
  updateName,
  updatePassword,
  updateEmail,
};
