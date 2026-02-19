import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { User } from '../models/User.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
};

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

const validateName = (value) => {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 2) {
    return 'At least 2 characters';
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPassword);
  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.sendStatus(404);
  }

  await user.update({ activationToken: null });

  res.send({ message: 'Account activated successfully!' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken !== null) {
    throw ApiError.forbidden();
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const confirmEmailChange = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: {
      activationToken,
      pendingEmail: { [Op.ne]: null },
    },
  });

  if (!user) {
    throw ApiError.badRequest('Link is invalid or has already been used.');
  }

  await user.update({
    email: user.pendingEmail,
    pendingEmail: null,
    activationToken: null,
  });

  res.send({ message: 'Email updated successfully!' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.badRequest('User with this email does not exist');
  }

  const resetToken = uuidv4();

  await user.update({ activationToken: resetToken });

  const resetLink = `${process.env.CLIENT_HOST}/reset-password/${resetToken}`;

  await emailService.send({
    email: user.email,
    subject: 'Password Reset Request',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to set a new password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });

  res.send({ message: 'Reset link sent to your email.' });
};

const resetPassword = async (req, res) => {
  const { activationToken, password } = req.body;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset link');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await user.update({
    password: hashedPassword,
    activationToken: null,
  });

  res.send({ message: 'Password has been reset successfully!' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  confirmEmailChange,
  forgotPassword,
  resetPassword,
};
