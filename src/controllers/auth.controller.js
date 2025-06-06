import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { authService } from '../services/auth.service.js';
import { validateEmail, validatePassword } from '../utils/validation.js';
import { mailer } from '../utils/mailer.js';
import { jwt } from '../utils/jwt.js';
import { tokenService } from '../services/token.service.js';
import { ApiError } from '../exeptions/api.error.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const saltRounds = 10;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const existingUser = await authService.getByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
    });
  }

  const activationToken = crypto.randomBytes(16).toString('hex');
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = await authService.createUser(
    name,
    email,
    hashedPassword,
    activationToken,
  );

  await mailer.sendActivationLink(email, activationToken);

  sendAuthentication(res, newUser);

  // res.send('Please, activate your account');
  // res.redirect(`/profile/${newUser.id}`);
};

const activate = async (req, res) => {
  const { email, token } = req.params;
  const user = await authService.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Activation error', {
      user: 'Invalid user',
    });
  }

  if (user.activationToken !== token) {
    throw ApiError.badRequest('Activation error', {
      token: 'Token is incorrect',
    });
  }

  const updatedUser = await authService.activate(email);

  res.redirect(`/profile/${updatedUser.id}`);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.getByEmail(email);

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  if (!user) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is invalid',
    });
  }

  const correctPassword = await bcrypt.compare(password, user.password);

  if (!correctPassword) {
    // return res.status(400).json({
    //   errors: { password: 'Password is invalid' },
    //   message: 'Validation error',
    // });

    throw ApiError.badRequest('Validation error', {
      password: 'Password is invalid',
    });
  }

  if (user.activationToken) {
    await mailer.sendActivationLink(email, user.activationToken);

    return res.send('Please, activate your account');
  }

  sendAuthentication(res, user);

  // res.redirect(`/profile/${user.id}`);
};

const sendAuthentication = async (res, user) => {
  const normalizedUser = authService.normalize(user);
  const accessToken = jwt.generateAccessToken(normalizedUser);
  const refreshToken = jwt.generateRefreshToken(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
    // maxAge: 20 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // res.send({
  //   normalizedUser,
  // });

  res.redirect(`/profile/${normalizedUser.id}`);
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const userData = jwt.validateRefreshToken(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    // res.status(401).json({ message: 'Invalid token' });
    // return;

    throw ApiError.unautorized({
      message: 'Invalid token',
    });
  }

  const user = await authService.getByEmail(userData.email);

  if (!user) {
    // res.status(401).json({ message: 'Invalid token' });
    // return;

    throw ApiError.unautorized({
      message: 'Invalid token',
    });
  }

  await sendAuthentication(res, user);

  // res.send(201);
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const userData = jwt.validateRefreshToken(refreshToken);

  if (!userData || !refreshToken) {
    // res.status(401).json({ message: 'Invalid token' });
    // return;

    throw ApiError.unautorized({
      message: 'Invalid token',
    });
  }

  await tokenService.remove(userData.id);

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.json({ redirectTo: `/login` });
};

const resetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await authService.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Validation error', {
      error: 'Invalid user',
    });
  }

  const resetToken = jwt.generateResetToken(user.dataValues);

  await mailer.sendResetLink(email, resetToken);

  res.send('The email has been sent, check your mail');
};

const resetPasswordConfirmation = async (req, res) => {
  const { email, token } = req.params;
  const { password, confirmationPassword } = req.body;

  const user = await authService.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Confirmation error', {
      user: 'Invalid user',
    });
  }

  const userData = jwt.validateResetToken(token);

  if (!userData) {
    throw ApiError.badRequest('Confirmation error', {
      token: 'Invalid token',
    });
  }

  if (password !== confirmationPassword) {
    throw ApiError.badRequest('Confirmation error', {
      password: 'Non similair passwords ',
    });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  await authService.changePassword(user.id, hashedPassword);

  res.json({ redirectTo: `/login` });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetPassword,
  resetPasswordConfirmation,
};
