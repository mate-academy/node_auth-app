import usersRepository from '../entity/users.repository.js';
import bcrypt from 'bcrypt';
import {
  validateEmail,
  validateName,
  validatePassword,
  normalize,
} from '../service/validation.service.js';
import { v4 as uuid } from 'uuid';
import { mailer } from '../service/email.service.js';
import { jwt } from '../utils/jwt.js';
import { tokensRepository } from '../entity/tokens.repository.js';
import ApiError from '../exceptions/ApiError.js';

const sendAuthentication = async (res, user) => {
  const userData = normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  const tokenFromDb = await tokensRepository.getByUserId(user.id);

  if (tokenFromDb) {
    await tokensRepository.deleteByUserId(user.id);
  }

  await tokensRepository.create(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  return res.json({
    user: userData,
    accessToken,
  });
};

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const validationErrors = {
    email: validateEmail(email),
    name: validateName(name),
    password: validatePassword(password),
  };

  const errors = Object.fromEntries(
    Object.entries(validationErrors).filter(([, value]) => value != null),
  );

  if (Object.keys(errors).length > 0) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const existingUserByEmail = await usersRepository.getByEmail(email);

  if (existingUserByEmail) {
    throw ApiError.Conflict(`User with email ${email} already exists.`);
  }

  const existingUserByName = await usersRepository.getByName(name);

  if (existingUserByName) {
    throw ApiError.Conflict(`User with name ${name} already exists.`);
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const activationToken = uuid();

  const user = await usersRepository.createUser(
    email,
    name,
    hashedPassword,
    activationToken,
  );

  await mailer.sendActivationLink(email, activationToken, name);

  res.status(201).json({
    message:
      'Registration successful. Please check your email to activate account.',
    user: normalize(user),
  });
};

const activate = async (req, res) => {
  const { activationToken, name } = req.params;
  const user = await usersRepository.getByName(name);

  if (!user || user.activationToken !== activationToken) {
    throw ApiError.NotFound('Activation link is invalid or has expired.');
  }

  await usersRepository.activate(user.email);

  res.json({ message: 'Account activated successfully. You can now log in.' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await usersRepository.getByEmail(email);

  if (!user) {
    throw ApiError.Unauthorized('Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.Unauthorized('Invalid email or password.');
  }

  if (user.activationToken) {
    throw ApiError.BadRequest(
      'Account is not activated. Please check your email.',
    );
  }

  await sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.Unauthorized('Refresh token not found.');
  }

  const userDataFromToken = jwt.validateRefreshToken(refreshToken);
  const tokenFromDb = await tokensRepository.getByToken(refreshToken);

  if (!userDataFromToken || !tokenFromDb) {
    throw ApiError.Unauthorized('Invalid or expired refresh token.');
  }

  const user = await usersRepository.getByEmail(userDataFromToken.email);

  if (!user) {
    throw ApiError.Unauthorized('User not found.');
  }

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    const tokenFromDb = await tokensRepository.getByToken(refreshToken);

    if (tokenFromDb) {
      await tokensRepository.deleteByUserId(tokenFromDb.userId);
    }
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await usersRepository.getByEmail(email);

  if (user) {
    const resetPasswordToken = uuid();

    await usersRepository.setResetPasswordToken(user.email, resetPasswordToken);

    await mailer.sendResetPasswordLink(
      user.email,
      resetPasswordToken,
      user.name,
    );
  }

  res.json({
    message: 'If an account exists, a password reset link has been sent.',
  });
};

const resetPassword = async (req, res) => {
  const { name, resetpasswordtoken } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw ApiError.BadRequest('Passwords do not match.');
  }

  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.BadRequest(passwordError);
  }

  const user = await usersRepository.getByName(name);

  if (!user || user.resetPasswordToken !== resetpasswordtoken) {
    throw ApiError.BadRequest('Reset link is invalid or has expired.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await usersRepository.resetPassword(user.email, hashedPassword);
  await usersRepository.setResetPasswordToken(user.email, null);

  res.json({ message: 'Password has been reset successfully.' });
};

const changeName = async (req, res) => {
  const { newName } = req.body;
  const { email } = req.user;

  const nameError = validateName(newName);

  if (nameError) {
    throw ApiError.BadRequest('Validation failed', { name: nameError });
  }

  const existingUser = await usersRepository.getByName(newName);

  if (existingUser) {
    throw ApiError.Conflict('This name is already taken.');
  }

  const updatedUser = await usersRepository.setNewName(email, newName);

  res.json(normalize(updatedUser));
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const { email } = req.user;

  if (newPassword !== confirmation) {
    throw ApiError.BadRequest('New password and confirmation do not match.');
  }

  const passwordValidationError = validatePassword(newPassword);

  if (passwordValidationError) {
    throw ApiError.BadRequest(passwordValidationError);
  }

  const user = await usersRepository.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.Unauthorized('Your old password is not correct.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await usersRepository.resetPassword(email, hashedPassword);

  res.json({ message: 'Password changed successfully.' });
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const { email: oldEmail, name } = req.user;

  const emailValidationError = validateEmail(newEmail);

  if (emailValidationError) {
    throw ApiError.BadRequest(emailValidationError);
  }

  const user = await usersRepository.getByEmail(oldEmail);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.Unauthorized('Invalid password.');
  }

  const existingUser = await usersRepository.getByEmail(newEmail);

  if (existingUser) {
    throw ApiError.Conflict('This email is already in use.');
  }

  const changeEmailToken = uuid();

  await usersRepository.setChangeEmailToken(
    oldEmail,
    changeEmailToken,
    newEmail,
  );
  await mailer.sendChangeEmailLink(newEmail, changeEmailToken, name);

  res.json({ message: 'Confirmation link sent to new email address.' });
};

const setNewEmail = async (req, res) => {
  const { name, changeemailtoken } = req.params;

  const user = await usersRepository.getByName(name);

  if (!user || user.changeEmailToken !== changeemailtoken || !user.newEmail) {
    throw ApiError.BadRequest('Email confirmation link is invalid or expired.');
  }

  const oldEmail = user.email;
  const newEmail = user.newEmail;

  const existingUser = await usersRepository.getByEmail(newEmail);

  if (existingUser) {
    throw ApiError.Conflict('This email address has been taken.');
  }

  const updatedUser = await usersRepository.setNewEmail(oldEmail, newEmail);

  await usersRepository.setChangeEmailToken(updatedUser.email, null, null);

  await mailer.sendEmailChangeConfirmation(oldEmail, newEmail);

  res.json({ message: 'Your email has been successfully updated.' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changeName,
  changePassword,
  changeEmail,
  setNewEmail,
};
