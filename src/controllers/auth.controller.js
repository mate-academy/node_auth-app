import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { jwtService } from '../services/jwt.service.js';
import { emailService } from '../services/email.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { validateName } from '../utils/validateName.js';
import { validatePassword } from '../utils/validatePassword.js';
import { validateEmail } from '../utils/validateEmail.js';

const register = async (req, res) => {
  const { email, password, userName } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    userName: validateName(userName),
  };

  if (errors.email || errors.password || errors.userName) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(email, hashedPassword, userName);

  res.send({ message: 'Email is sent. Confirm your account' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await userService.findByActivationToken(activationToken);

  if (!user) {
    throw ApiError.badRequest('Invalid activation token', {
      activationToken: 'Invalid activation token',
    });
  }

  user.activationToken = null;
  user.save();

  res.send({ message: 'Account activated', redirectUrl: '/profile' });
};

const generateTokens = async (res, user, redirectUrl) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
    redirectUrl,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User is not found');
  }

  const activatedUser = user.activationToken === null;

  if (!activatedUser) {
    throw ApiError.badRequest('Please verify your account first', {
      email: 'Verify your email address',
    });
  }

  const isPasswordValid = bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  generateTokens(res, user, '/profile');
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unAuthorized();
  }

  const user = await userService.findByEmail(userData.email);

  generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unAuthorized();
  }

  await tokenService.remove(userData.id);
  res.send({ message: 'Logged out successfully' });
};

const reset = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found', {
      email: 'User not found',
    });
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  await user.save();
  await emailService.sendResetPasswordEmail(email, resetToken);

  res.send({
    message: 'Password reset email sent. Use the token to reset your password',
  });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmation } = req.body;

  const user = await userService.findByResetToken(resetToken);

  if (!user) {
    throw ApiError.badRequest('Invalid reset token');
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;

  user.save();

  res.send({
    message: 'Password is changed',
  });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  reset,
  resetPassword,
};
