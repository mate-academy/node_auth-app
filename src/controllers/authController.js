import bcrypt from 'bcrypt';

import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/User.js';
import { jwtService } from '../services/jwtService.js';
import { tokenService } from '../services/tokenService.js';
import { userService } from '../services/userService.js';
import { authService } from '../services/authService.js';

async function register(req, res, next) {
  const { name, email, password } = req.body;

  const errors = {
    name: authService.validateName(name),
    email: authService.validateEmail(email),
    password: authService.validatePassword(password),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register({ email, password, name });

  res.send({ message: 'OK' });
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

  await sendAuthentication(res, user);
}

async function login(req, res, next) {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  await sendAuthentication(res, user);
}

async function refresh(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.getByEmail(userData.email);

  await sendAuthentication(res, user);
}

async function logout(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
}

async function sendAuthentication(res, user) {
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
}

const reqPwdReset = async (req, res) => {
  const { email } = req.body;
  const user = await userService.getByEmail(email);

  const errors = {
    email:
      authService.validateEmail(email) ||
      (!user ? 'Email not found' : undefined) ||
      (user.activationToken ? 'User not activated' : undefined),
  };

  if (errors.email) {
    throw ApiError.badRequest('Bad request', errors);
  }

  await userService.reqPwdReset(email);
  res.send({ message: 'OK' });
};

const validatePwResetToken = async (req, res) => {
  const { pwdResetToken } = req.params;
  const user = await User.findOne({ where: { pwdResetToken } });

  const errors = {
    token:
      (!user ? 'invalid token' : undefined) ||
      (!pwdResetToken ? 'token required' : undefined),
  };

  if (errors.pwdResetToken) {
    throw ApiError.badRequest('Bad request', errors);
  }

  res.send({ message: 'OK' });
};

const pwdReset = async (req, res) => {
  const { pwdResetToken } = req.params;
  const { password, confirmPassword } = req.body;
  const user = await User.findOne({ where: { pwdResetToken } });

  const errors = {
    password:
      authService.validatePassword(password) ||
      (confirmPassword !== password ? 'Passwords do not match' : undefined),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  user.pwdResetToken = null;
  user.save();

  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  reqPwdReset,
  validatePwResetToken,
  pwdReset,
};
