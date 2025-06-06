import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { APIError } from '../exceptions/api.error.js';
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
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw APIError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(email, hashedPassword);
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
  user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw APIError.badRequest('No such user');
  }

  const isPasswordValid = bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw APIError.badRequest('Wrong password');
  }
  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);
  const token = tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw APIError.unauthorized();
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
    httpÓnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw APIError.unauthorized();
  }

  await tokenService.remove(refreshToken);

  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};
