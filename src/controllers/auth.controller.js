import { ApiError } from '../exeptions/apiError.js';
import { User } from '../models/User.js';
import jwtService from '../services/jwt.service.js';
import tokenService from '../services/token.service.js';
import userService from '../services/user.service.js';
import bcrypt from 'bcrypt';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation.js';

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const errors = {
    email: validateEmail(email),
    name: validateName(name),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register(req.body);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.sendStatus(404);
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('No such user', {
      email: 'Email not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Validation error', {
      password: 'Password is wrong',
    });
  }

  if (user.activationToken) {
    throw ApiError.BadRequest('Activation error', {
      email: 'Confirm email',
    });
  }
  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  res.clearCookie('refreshToken');

  const userData = jwtService.verifyRefreshToken(refreshToken);

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefreshToken(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.Unauthorized();
  }

  sendAuthentication(res, userData);
};

const sendAuthentication = async (res, user) => {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
};

export default {
  register,
  activate,
  login,
  logout,
  refresh,
};
