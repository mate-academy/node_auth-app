import { User } from '../models/user.js';
import { userServices } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPatterns = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPatterns.test(value)) {
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
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(email),
  };
  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await userServices.register(email, hashedPassword);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({
    where: { activationToken: activationToken },
  });

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

  const user = await userServices.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userServices.findByEmail(userData.email);
  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userServices.normalize(user);
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

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized()
    return
  }

  tokenService.remove(userData.id);

  res.send(204)
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};
