import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return !emailRegex.test(email);
}

function validatePassword(password) {
  return typeof password !== 'string' || password.length < 6;
}

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
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
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Wrong email or password');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Activate your account via email');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong email or password');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unathorized();
  }

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unathorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
};
