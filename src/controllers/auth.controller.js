import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

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

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }
}

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    name: validateName(name),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register({
    password: hashedPassword,
    email,
    name,
  });

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  const normalizedUser = userService.normalize(user);

  res.send(normalizedUser);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPassword = await bcrypt.compare(password, user.password);

  if (!isPassword) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 5 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const user = await jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(user.id);

  res.sendStatus(204);
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  const existUser = await userService.findByEmail(email);

  if (!existUser) {
    throw ApiError.badRequest('No such user');
  }

  const resetToken = uuidv4();

  existUser.resetToken = resetToken;
  await existUser.save();

  await emailService.sendResetPasswordEmail(email, resetToken);

  res.send({ message: 'OK' });
};

const processResetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmation } = req.body;

  if (!resetToken) {
    throw ApiError.badRequest('No such user');
  }

  if (!password) {
    throw ApiError.badRequest('No password');
  }

  const ifPasswordValid = validatePassword(password);

  if (ifPasswordValid) {
    throw ApiError.badRequest('Validation error', {
      password: ifPasswordValid,
    });
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.findOne({
    where: { resetToken },
  });

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  await user.save();

  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  processResetPassword,
  resetPassword,
};
