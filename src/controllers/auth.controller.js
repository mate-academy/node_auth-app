/* eslint-disable max-len */
import { User } from '../models/user.js';
import { PASSWORD_PATTERN } from '../utils/constants.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
  const re = PASSWORD_PATTERN;

  return re.test(String(password));
}

const register = async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    res.status(400).send('All fields are required');

    return;
  }

  const errors = {
    email: !validateEmail(email) ? 'Invalid email' : null,
    password: !validatePassword(password)
      ? 'Password must be at least 6 characters long and contain at least one letter and one number'
      : null,
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register({ email, password: hashedPassword, username });

  res.send({
    message:
      'User registered successfully. Please check your email to activate your account.',
  });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  if (!activationToken) {
    res.status(400).send('Activation token is required');

    return;
  }

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.status(404).send('User not found');

    return;
  }

  await user.update({ activationToken: null });
  await user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send('All fields are required');

    return;
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    res.status(401).send('Invalid email or password');

    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).send('Invalid email or password');

    return;
  }

  const normalizedUser = userService.normalize(user);

  await jwtService.generatePair(res, normalizedUser);

  res.send(normalizedUser);
};

const logout = async (req, res) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).send('Access token cookie is required');

    return;
  }

  const decoded = jwtService.verify(token);

  if (!decoded) {
    res.status(401).send('Invalid token');

    return;
  }

  await userService.updateRefreshToken(decoded.id, null);

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.send({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).send('Access token cookie is required');

    return;
  }

  const decoded = jwtService.verify(token);

  if (!decoded) {
    res.status(401).send('Invalid token');

    return;
  }

  res.send(decoded);
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).send('Refresh token cookie is required');

    return;
  }

  const decoded = jwtService.verifyRefresh(refreshToken);

  if (!decoded) {
    res.status(401).send('Invalid token');

    return;
  }

  const user = await userService.findById(decoded.id);

  if (!user) {
    res.status(401).send('User not found');

    return;
  }

  if (user.refreshToken !== refreshToken) {
    res.status(401).send('Invalid refresh token');

    return;
  }

  const normalizedUser = userService.normalize(user);

  await jwtService.generatePair(res, normalizedUser);

  res.send(normalizedUser);
};

export const authController = {
  register,
  activate,
  login,
  getMe,
  refresh,
  logout,
};
