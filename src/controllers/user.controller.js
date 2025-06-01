import bcrypt from 'bcrypt';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { ApiError } from '../exceptions/api.error.js';
import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service.js';
import { generateTokens } from '../utils/generateTokens.js';

const updateFullName = async (req, res) => {
  const { firstName, lastName } = req.body;

  const { id } = req.user;

  if (!firstName || !lastName) {
    throw ApiError.badRequest('First name and last name are required');
  }

  if (firstName.length < 2 || lastName.length < 2) {
    throw ApiError.badRequest(
      'First name and last name must be at least 2 characters long',
    );
  }

  if (!id) {
    throw ApiError.badRequest('Unauthorized');
  }

  const user = await userService.updateFullName(id, firstName, lastName);

  res.status(200).json(user);
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;

  if (!oldPassword || !newPassword) {
    throw ApiError.badRequest('All fields are required');
  }

  if (!id) {
    throw ApiError.badRequest('Unauthorized');
  }

  const user = await userService.getExistingUserById(id);

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid old password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userService.updatePassword(id, hashedPassword);

  res.status(200).json({ message: 'Password updated successfully' });
};

const requestEmailChange = async (req, res) => {
  const { newEmail, password } = req.body;
  const { id } = req.user;

  if (!newEmail || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  if (!id) {
    throw ApiError.badRequest('Unauthorized');
  }

  const user = await userService.getExistingUserById(id);

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid password');
  }

  const isEmailAlreadyInUse = await userService.findByEmail(newEmail);

  if (isEmailAlreadyInUse) {
    throw ApiError.badRequest('Email already in use');
  }

  const token = jwt.sign({ userId: user.id, newEmail }, process.env.JWT_KEY, {
    expiresIn: '1d',
  });

  await emailService.sendEmailChangeConfirmation(newEmail, token);

  res.status(200).json({ message: 'Confirmation link sent to new email' });
};

const confirmEmailChange = async (req, res) => {
  const { token } = req.params;
  let payload;

  if (!token) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  try {
    payload = jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    throw ApiError.badRequest('Invalid token');
  }

  const user = await userService.getExistingUserById(payload.userId);
  const oldEmail = user.email;

  user.email = payload.newEmail;
  await user.save();

  await emailService.sendEmailChangeNotification(oldEmail, payload.newEmail);

  await generateTokens(res, user);
};

export const userController = {
  updateFullName,
  updatePassword,
  requestEmailChange,
  confirmEmailChange,
};
