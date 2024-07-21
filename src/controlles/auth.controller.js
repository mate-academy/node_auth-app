import uuid4 from 'uuid4';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

export function validatePassword(password) {
  return password.length >= 6;
}

const generateTokens = async (res, user) => {
  const normalizeUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizeUser);
  const refreshAccessToken = jwtService.signRefresh(normalizeUser);

  await tokenService.save(normalizeUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  const send = {
    user: normalizeUser,
    accessToken,
  };

  return send;
};

const register = async (req, res) => {
  const { email, password: pass, name } = req.body;
  const activationToken = uuid4();

  const errors = {
    email: validateEmail(email),
    password: validatePassword(pass),
  };

  if (!errors.email) {
    throw ApiError.badRequest(
      `Invalid email address.
      Please enter a valid email address in the format "example@example.com".`,
      errors,
    );
  }

  if (!errors.password) {
    throw ApiError.badRequest(
      `Incorrect password.
      The length of the fault must be at least 6 characters`,
      errors,
    );
  }

  const existUser = await userService.findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User Already exist', {
      email: 'User already exist',
    });
  }

  const password = await bcrypt.hash(pass, 10);
  const newUser = await User.create({
    email,
    password,
    name,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);

  res.send(newUser);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }
  user.activationToken = null;
  user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken) {
    return res.status(403).send('Confirm your email');
  }

  res.redirect(`http://localhost:${process.env.PORT}/user/${user.id}`);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);
  const send = await generateTokens(res, user);

  res.send(send);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove();

  res.sendStatus(204);
};

const passwordReset = async (req, res) => {
  const { passwordResetToken } = req.params;
  const { password, confirmation } = req.body;

  if (password !== confirmation) {
    throw ApiError.badRequest(
      `Passwords do not match.
      Please make sure both password fields are the same.`,
    );
  }

  if (!validatePassword(password)) {
    throw ApiError.badRequest(
      `Incorrect password.
      The length of the fault must be at least 6 characters`,
    );
  }

  const user = await User.findOne({ where: { passwordResetToken } });

  if (!user) {
    res.status(404).send('Invalid or expired password reset token');

    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.passwordResetToken = null;
  await user.save();

  res.send('Password has been reset successfully');
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    res.status(404).send('User not found');

    return;
  }

  const passwordResetToken = uuid4();

  user.passwordResetToken = passwordResetToken;
  await user.save();
  await emailService.passwordReset(email, passwordResetToken);

  res.send('Password reset link has been sent to your email');
};

export const authController = {
  register: register,
  activate,
  login,
  refresh,
  logout,
  passwordReset,
  requestPasswordReset,
};
