import { User } from '../models/user.js';

import { userService } from '../service/user.service.js';
import { jwtService } from '../service/jwt.service.js';
import { Validate } from '../utils/validate.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../service/token.service.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: Validate.name(name),
    email: Validate.email(email),
    password: Validate.password(password),
  };

  if (errors.email || errors.name || errors.password) {
    throw ApiError.badRequest('Bad Request', {
      errors,
    });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.send({ message: 'Ok' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: {
      activationToken,
    },
  });

  if (!user) {
    throw ApiError.notFound('Not found user');
  }

  user.activationToken = null;
  await user.save();

  return res.redirect(`${process.env.CLIENT_HOST}/profile`);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Not such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong pass');
  }

  if (user.activationToken !== null) {
    throw ApiError.forbidden('You need to activate your email');
  }

  await generateTokens(res, user, 'profile');
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const token = await tokenService.getByToken(refreshToken);

  const user = jwtService.verifyRefresh(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  await generateTokens(res, user);
};

const generateTokens = async (res, user, redirect = null) => {
  const normalizeUser = userService.normalizeUser(user);

  const accessToken = jwtService.sign(normalizeUser);
  const refreshToken = jwtService.signRefresh(normalizeUser);

  await tokenService.save(normalizeUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 1000,
    httpOnly: true,
  });

  if (redirect !== null) {
    return res.redirect(`${process.env.CLIENT_HOST}/${redirect}`);
  }

  res.send({
    user: normalizeUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};
