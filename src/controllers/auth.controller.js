import { ApiError } from '../exeptions/api.errors.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';
import { emailService } from '../services/email.service.js';
import { JWTService } from '../services/jwt.service.js';
import { userService } from '../services/user.service.js';
import { normalizedUser } from '../utils/normilizedUser.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import 'dotenv/config';
import { validateEmail, validatePassword } from '../utils/validate.js';

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const activationToken = uuidv4();

  const hashPassword = bcrypt.hashSync(password, 10);

  await authService.register(name, email, hashPassword, activationToken);

  await emailService.sendActivationLink(name, email, activationToken);

  res.status(201).send({ message: 'User created' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound({ message: 'User not found' });
  }

  user.activationToken = null;

  await user.save();

  res.redirect(`${process.env.CLIENT_URL}/profile`);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findUserByEmail(email);

  if (!user) {
    throw ApiError.notFound({ message: 'No such user' });
  }

  if (user.activationToken) {
    throw ApiError.notFound({ message: 'User not activated' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.notFound({ message: 'Bad password' });
  }

  generateTokens(res, user);
};

const refresh = (req, res) => {
  const { refreshToken } = req.cookies;

  const user = JWTService.verifyRefresh(refreshToken);

  const token = tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const newUser = normalizedUser(user);
  const accessToken = JWTService.sign(user);

  const refreshToken = JWTService.signRefresh(user);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  res.send({ user: newUser, accessToken });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = JWTService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unAuthorized();
  }

  await tokenService.remove(user.id);

  res.clearCookie('refreshToken');

  res.send({ message: 'User logged out' });
};
export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};
