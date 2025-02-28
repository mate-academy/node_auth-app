import { User } from '../models/user.model.js';
import { userService } from '../service/user.service.js';
import { jwtService } from '../service/jwt.service.js';
import { ApiError } from '../exeptions/apiError.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../service/token.service.js';

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
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashPass = await bcrypt.hash(password, 10);

  await userService.register(email, hashPass);

  res.status(201).send({
    message: 'OK',
  });
};

const activate = async (req, res) => {
  const { activationdToken } = req.params;

  const user = await User.findOne({
    where: { activationdToken },
  });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationdToken = null;
  user.save();

  return res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  const isPasValid = bcrypt.compare(password, user.password);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (!isPasValid) {
    throw ApiError.badRequest('Wrong Password');
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const user = jwtService.verifyRefresh(refreshToken);

  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unAuthorizate();
  }

  generateTokens(res, user);
};

async function generateTokens(res, user) {
  const normalizeUser = userService.normalize(user);
  const refreshToken = await jwtService.signRefresh(normalizeUser);
  const accessToken = await jwtService.signAccess(normalizeUser); // maybe del

  await tokenService.save(normalizeUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizeUser,
    accessToken, //
  });
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const user = jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unAuthorizate();
  }
  await tokenService.removeToken(user.id);

  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};
