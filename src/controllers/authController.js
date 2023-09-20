
import { User } from '../models/User.js';
import { jwtService } from '../services/jwtService.js';
import { ApiError } from '../exeptions/apiError.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/tokenService.js';
import { userService } from '../services/userService';

const validateEmai = (email) => {
  if (!email) {
    return 'Email is required';
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+/;

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
};

async function register(req, res, next) {
  const { email, password } = req.body;

  const errors = {
    email: validateEmai(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await register(email, hashedPass);

  res.send({ message: 'OK' });
};

async function reset(req, res, next) {
  const { email, password } = req.body;

  try {
    await userService.reset(email, password);

    res.status(200).send({
      message: 'OK',
    });
  } catch (error) {
    res.status(500).send({
      message: 'error',
    });
  }
}

async function activate(req, res, next) {
  const { activationToken } = req.params;
  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  res.send(user);
};

async function login(req, res) {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  };

  const normalizedUser = userService.normalize(user);

  const accesToken = jwtService.sign(normalizedUser);

  res.send({
    user: normalizedUser,
    accesToken,
  });
};

async function refresh(req, res) {
  const { refreshAccessToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshAccessToken);

  if (!userData) {
    throw ApiError.badRequest();
  }
};

async function logout(req, res) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.removeToken(userData.id);
  }

  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  reset,
};
