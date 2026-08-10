import { ApiError } from '../exceptions/ApiError.js';
import { emailService } from '../services/emailService.js';
import { userService } from '../services/userService.js';
import bcrypt from 'bcrypt';

async function nameChange(req, res, next) {
  const { email, newName } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User does not exist');
  }

  await userService.nameChange(user, newName);

  res.send({ message: 'OK' });
}

async function passwordChange(req, res, next) {
  const { email, password, confirmPassword } = req.body;

  const user = await userService.getByEmail(email);
  const isMatched = await bcrypt.compare(password, user.password);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  if (password !== confirmPassword) {
    throw ApiError.BadRequest('Passwords should be equal');
  }

  if (isMatched) {
    throw ApiError.BadRequest('You need to create new password');
  }

  await userService.resetPassword(email, password);

  res.send({ message: 'OK' });
}

async function emailChange(req, res, next) {
  const { password, newEmail, email } = req.body;

  const user = await userService.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  const emailIsNotValid = emailService.validateEmail(newEmail);

  if (emailIsNotValid) {
    throw ApiError.BadRequest('Email is invalid');
  }

  await userService.emailChange(user, newEmail, email);

  res.send({ message: 'OK' });
}

export const profileController = {
  nameChange,
  passwordChange,
  emailChange,
};
