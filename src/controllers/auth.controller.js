import bcrypt from 'bcrypt';

import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { tokenService } from '../services/token.service.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validateName(value) {
  if (!value || value.trim() === '') {
    return 'Name is required';
  }

  const namePatter = /^[A-Za-z]+$/;

  if (!namePatter.test(value)) {
    return 'Name has to contain only letters';
  }
}

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await userService.findByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already used',
    });
  }

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.name || errors.password) {
    throw ApiError.BadRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);
  const activationToken = uuidv4();

  const newUser = await User.create({
    name,
    email,
    password: hashedPass,
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

  if (!user) {
    throw ApiError.NotFound('User doesn`t exist', {
      email: 'User with this email does not exist',
    });
  }

  const isPassWordCorrect = await bcrypt.compare(password, user.password);

  if (!user || !isPassWordCorrect || user.activationToken) {
    throw ApiError.BadRequest('Invalid email or password', {
      email: 'Wrong email',
      password: 'Wrong password',
    });
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.Unauthorized();
  }

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
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
};

const reset = async (req, res) => {
  const { email } = req.body;

  await emailService.sendResetPassEmail(email);

  res.sendStatus(204);
};

const resetPass = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw ApiError.BadRequest('Passwords dont match');
  }

  const userToken = jwtService.verifyRefresh(refreshToken);
  const user = await userService.findByEmail(userToken.email);

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  user.save();

  res.sendStatus(200);
};

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  reset,
  resetPass,
};
