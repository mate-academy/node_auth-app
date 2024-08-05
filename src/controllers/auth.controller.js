import bcrypt from 'bcrypt';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }
  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    name: !name ? 'Name is required' : null,
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.BadRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await userService.findByActivationToken(activationToken);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.activationToken = null;
  await user.save();

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
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);
  if (!user) {
    throw ApiError.BadRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  if (user.activationToken) {
    throw ApiError.BadRequest('Account not activated. Please check your email.');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.Unauthorized('No refresh token found');
  }

  const userData = jwtService.verifyRefresh(refreshToken);
  if (!userData) {
    throw ApiError.Unauthorized('Invalid refresh token');
  }

  const user = await userService.findByEmail(userData.email);
  const newAccessToken = jwtService.sign(user);

  res.send({ accessToken: newAccessToken });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.Unauthorized();
  }

  await tokenService.remove(userData.id);
  res.sendStatus(204);
};

const generateTokens = async (res, user) => {
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
  });
};

const sendResetEmail = async (req, res) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('No such user');
  }

  const resetToken = jwtService.signResetToken({ id: user.id });
  await emailService.sendResetEmail(email, resetToken);

  res.send({ message: 'Password reset email sent' });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmation } = req.body;

  if (password !== confirmation) {
    throw ApiError.BadRequest('Passwords do not match');
  }

  const userData = jwtService.verify(resetToken);

  if (!userData) {
    throw ApiError.Unauthorized('Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await userService.updatePassword(userData.id, hashedPassword);

  res.send({ message: 'Password updated successfully' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetPassword,
  sendResetEmail,
};
