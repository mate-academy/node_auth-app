import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.model.js';
import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { validation } from '../utils/validation.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { v4 as uuidv4 } from 'uuid';
import { mailer } from '../utils/nodemailer.js';

const register = async (req, res) => {
  const { email, name, password } = req.body;

  if (req.user) {
    throw ApiError.forbidden();
  }

  const errors = {
    email: validation.validateEmail(email),
    password: validation.validatePassword(password),
    name: validation.validateName(name),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const existingUser = await userService.findUserByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.registration(name, email, hashedPassword);

  res.status(201).json({ message: 'User created successfully' });
};

const activate = async (req, res) => {
  const { email, activationToken } = req.params;

  if (req.user) {
    throw ApiError.forbidden();
  }

  const user = await User.findOne({ where: { email, activationToken } });

  if (!user) {
    throw ApiError.badRequest({
      email: 'User does not exist or have been already activated',
    });
  }

  user.activationToken = null;
  await user.save();

  res.redirect(`${process.env.CLIENT_HOST}/me`);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (req.user) {
    throw ApiError.forbidden();
  }

  const user = await userService.findUserByEmail(email);

  if (!user) {
    throw ApiError.notFound({
      email: 'User with this email does not exist',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('User is not activated', {
      email: 'Check your email and activate your account',
    });
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findUserByEmail(userData.email);

  await generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalizeUser(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 100000000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken: accessToken,
  });
};

const logout = async (req, res) => {
  const user = req.user;

  if (user) {
    throw ApiError.forbidden();
  }

  await tokenService.removeToken(user.id);

  res.sendStatus(204);
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmedNewPassword } = req.body;

  if (!req.user) {
    throw ApiError.forbidden();
  }

  const userId = req.user.id;
  const user = await User.findOne({ where: { userId } });

  if (!user) {
    throw ApiError.badRequest('Bad request', {
      user: 'No such user',
    });
  }

  const passwordError = await validation.validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.badRequest('Bad request', {
      password: passwordError,
    });
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Bad request', {
      password: 'Old password is wrong',
    });
  }

  if (newPassword !== confirmedNewPassword) {
    throw ApiError.badRequest('Bad request', {
      password: 'Confirm new password',
    });
  }

  if (newPassword === oldPassword) {
    throw ApiError.badRequest('Bad request', {
      password: 'Old and new password cannot be the same',
    });
  }

  const passwordChangeToken = uuidv4();
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.passwordChangeToken = passwordChangeToken;
  user.pendingPassword = hashedPassword;
  await user.save();

  mailer.sendPasswordChangeEmail(req.user.email, passwordChangeToken);

  res
    .status(200)
    .json({ message: 'To confirm password change please check your email' });
};

const confirmPasswordChange = async (req, res) => {
  const { email, passwordChangeToken } = req.params;
  const user = await User.findOne({ where: { email, passwordChangeToken } });

  if (!user) {
    throw ApiError.badRequest('Bad request', {
      email: 'Invalid or expired link',
    });
  }

  user.password = user.pendingPassword;
  user.pendingPassword = null;
  user.passwordChangeToken = null;
  await user.save();

  res.redirect(`${process.env.CLIENT_HOST}/password-changed-successfully`);
};

const changeName = async (req, res) => {
  const name = req.body.name;
  const nameError = validation.validateName(name);

  if (nameError) {
    throw ApiError.badRequest('Bad request', { error: nameError });
  }

  const user = await User.findOne({ where: { id: req.user.id } });

  if (!user) {
    throw ApiError.notFound();
  }

  user.name = name;
  await user.save();

  res
    .status(200)
    .json({ message: 'Name has been successfully changed', name: user.name });
};

const changeEmail = async (req, res) => {
  const { newEmail, password } = req.body;

  if (!req.user) {
    throw ApiError.forbidden();
  }

  const user = await User.findOne({ where: { id: req.user.id } });

  if (!user) {
    throw ApiError.notFound('Not found', {
      user: 'User not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Bad request', {
      password: 'Password is wrong',
    });
  }

  const emailError = validation.validateEmail(newEmail);

  if (emailError) {
    throw ApiError.badRequest('Bad request', {
      email: emailError,
    });
  }

  const existingUser = await userService.findUserByEmail(newEmail);

  if (existingUser) {
    throw ApiError.badRequest('Bad request', {
      email: 'This email is already in use',
    });
  }

  const emailChangeToken = uuidv4();

  user.emailChangeToken = emailChangeToken;
  user.pendingEmail = newEmail;
  await user.save();

  await mailer.sendEmailChangeLetter(user.email, emailChangeToken);

  res.status(200).json({
    message: 'To confirm email change please check your current email',
  });
};

const confirmEmailChange = async (req, res) => {
  const { email, emailChangeToken } = req.params;

  const user = await User.findOne({ where: { email, emailChangeToken } });

  if (!user) {
    throw ApiError.badRequest('Bad request', {
      email: 'Invalid or expired link',
    });
  }

  user.email = user.pendingEmail;
  user.emailChangeToken = null;
  user.pendingEmail = null;
  await user.save();

  res.redirect(`${process.env.CLIENT_HOST}/email-changed-successfully`);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  changePassword,
  confirmPasswordChange,
  changeName,
  changeEmail,
  confirmEmailChange,
};
