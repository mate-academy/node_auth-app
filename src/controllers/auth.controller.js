import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 3) {
    return 'Name must be at least 3 characters';
  }
}

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPatern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPatern.test(value)) {
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
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.send({ message: 'OK' });
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

  await generateTokens(res, user);

  res.redirect(process.env.CLIENT_HOST + '/profile');
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('', errors);
  }

  if (!email || !password) {
    return next(ApiError.badRequest('All fields are required'));
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    return next(ApiError.badRequest('Email or password is incorrect'));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(ApiError.badRequest('Email or password is incorrect'));
  }

  if (user.activationToken) {
    return next(ApiError.badRequest('Please activate your email first'));
  }

  await generateTokens(res, user);

  res.redirect(process.env.CLIENT_HOST + '/profile');
};

const logout = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    return next(ApiError.unAuthorized());
  }

  await tokenService.remove(userData.id);

  res.redirect(process.env.CLIENT_HOST + '/login');
};

const refresh = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    return next(ApiError.unAuthorized());
  }

  const user = await userService.findByEmail(userData.email);

  generateTokens(res, user);
};

export const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const resetPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);

  const erorrs = {
    email: 'Email is required',
  };

  if (!user) {
    return next(ApiError.notFound(erorrs));
  }

  const confirmToken = uuidv4();

  user.confirmToken = confirmToken;
  user.confirmTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000);
  await user.save();

  await emailService.sendResetPassword(email, confirmToken);

  res.status(200).send('The message was sent by email');
};

const confirmResetPassword = async (req, res, next) => {
  const { confirmToken } = req.params;
  const { newPassword, confirmedPassword } = req.body;

  const user = await User.findOne({ where: { confirmToken } });

  if (!user) {
    return next(ApiError.notFound({ message: 'User not found' }));
  }

  if (user.confirmTokenExpiry < new Date()) {
    return next(ApiError.badRequest({ message: 'Token expired' }));
  }

  if (newPassword.trim() !== confirmedPassword.trim()) {
    return next(
      ApiError.badRequest({ newPassword: 'New passwords do not match' }),
    );
  }

  const isSamePassword = await bcrypt.compare(confirmedPassword, user.password);

  if (isSamePassword) {
    return next(
      ApiError.badRequest({
        newPassword: 'New password must be different from old password',
      }),
    );
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.confirmToken = null;
  user.confirmTokenExpiry = null;
  await user.save();

  res.status(200).send('Password changed');
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetPassword,
  confirmResetPassword,
  generateTokens,
};
