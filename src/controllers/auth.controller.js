import { ApiError } from '../exeptions/api.error.js';
import { User } from '../modules/User.js';
import { jwtService } from '../service/jwt.service.js';
import { tokenService } from '../service/token.service.js';
import { userService } from '../service/user.service.js';
import bcrypt from 'bcrypt';
import { ConsoleLoger } from '../untils/consoleLoger.js';

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
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

const register = async (req, res) => {
  const { email, password, userName } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Email, password, are not validate', errors);
  }

  const hashPass = await bcrypt.hash(password, 10);

  await userService.register(email, hashPass, userName);

  res.status(201).send({
    message:
      'User registered successfully, check your email for activate account',
  });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  res.send(user);
};
// як перенаправити на профіль????

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  generateToken(res, user);
  ConsoleLoger.log(`${user.email} login`);
};
// як перенаправити на профіль????

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await jwtService.signRefresh(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorize();
  }

  const email = userData.email;

  const user = await User.findOne({ where: { email } });

  generateToken(res, user);
};

const generateToken = async (res, user) => {
  const normalizeUser = userService.normalize(user);

  const accessToken = await jwtService.sign(normalizeUser);
  const refreshToken = await jwtService.signRefresh(normalizeUser);

  await tokenService.save(normalizeUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizeUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorize();
  }

  await tokenService.remove(userData.id);

  res.clearCookie('refreshToken');

  res.sendStatus(204);
};

const reset = async (req, res) => {
  const { email } = req.body;
  const user = User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.badRequest('Not found');
  }

  userService.sendResetEmail(email);

  ConsoleLoger.log(email);
  res.send('Email send, check your email for reset password');
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword, confirmation } = req.body;

  const user = await User.findOne({ where: { resetToken } });

  if (!user || !resetToken) {
    throw ApiError.badRequest('Invalid reset token or user not found');
  }

  if (newPassword !== confirmation) {
    res.status(400).send('Passwords do not match');

    return;
  }

  const hashPass = await bcrypt.hash(newPassword, 10);

  userService.changePassword(user.userName, hashPass);
  res.send('Password change sucssessfull');
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
