import { ApiError } from '../exceptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

export function validateEmail(email) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

export function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.send({
    message: 'OK',
  });
};

const activate = async (req, res, next) => {
  const { activationToken } = req.params;
  const user = await userService.findByActivationToken(activationToken);

  if (!user) {
    throw ApiError.notFound({ email: 'this email doesn`t exist' });
  }

  user.activationToken = null;
  await user.save();

  res.send({
    message: 'OK',
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.unauthorized({ email: 'this email doesn`t exist' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized({ password: 'wrong password' });
  }

  if (user.activationToken) {
    throw ApiError.unauthorized({ email: 'please activate the email' });
  }

  await generateTokens(res, user);
};

const refresh = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

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
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const sendResetMessage = async (req, res, next) => {
  const { email } = req.body;

  await userService.sendResetMessage(email);

  res.send({
    message: 'OK',
  });
};

const resetPassword = async (req, res, next) => {
  const { resetPasswordToken } = req.params;
  const { newPassword, confirmPassword } = req.body;

  const errors = {
    password: validatePassword(newPassword),
  };

  const user = await userService.findByResetPasswordToken(resetPasswordToken);

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('password and confirmation fields must be equal');
  }

  if (!user) {
    throw ApiError.notFound({ email: 'this email doesn`t exist' });
  }

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  await userService.changePassword(user.email, hashedPass);

  user.resetPasswordToken = null;
  await user.save();

  res.send({
    message: 'OK',
  });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  sendResetMessage,
  resetPassword,
};
