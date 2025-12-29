import bcrypt from 'bcrypt';
import { userService } from '../services/user.service.js';
import { User } from '../models/user.model.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { tokenService } from '../services/token.service.js';
import { Token } from '../models/token.model.js';

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Email is not valid';
}

function validateName(value) {
  if (!value) return 'Name is required';
  if (value.trim().length < 4) return 'Name length must be more than 4 symbols';
}

const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'At least 6 characters';
};

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    name: validateName(name),
  };

  if (errors.email || errors.password || errors.name) {
    return res.sendStatus(400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(email, hashedPassword, name);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { email, activationToken } = req.params;

  const user = await User.findOne({
    where: {
      email,
      activationToken,
    },
  });

  if (!user) {
    return res.sendStatus(404);
  }

  user.activationToken = null;
  await user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.unauthorized();
  }

  if (user.activationToken) {
    throw ApiError.unauthorized();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.sendStatus(401);
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(user.id);

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalizedUser(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // true на продакшені
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const forgot = async (req, res) => {
  const { email } = req.body;

  await userService.forgot(email);

  res.send({ message: 'OK' });
};

const passwordReset = async (req, res) => {
  const { email, resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  if (validatePassword(password)) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (validatePassword(password)) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters' });
  }

  const user = await User.findOne({
    where: {
      email,
      resetToken,
    },
  });

  if (!user) {
    return res.sendStatus(404);
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  await user.save();

  res.send(user);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgot,
  passwordReset,
  validatePassword,
};
