import { User } from '../model/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeption/api.errors.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';

const validateEmail = (email) => {
  if (!email) {
    return 'Email should be added';
  }

  const emailPattern = /^[\w.-]+@[\w.-]+\.\w+$/;

  if (!emailPattern.test(email)) {
    return 'Email should be valid';
  }

  return null;
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'The password length should not be less than 8 characters';
  }

  return null;
};

const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(email, hashedPass);
  res.send({ message: 'User registered successfully' });
};

const activate = (req, res) => {
  const { activationToken } = req.params;
  const user = User.findOne({ where: activationToken });

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

  const userData = await jwtService.verify(refreshToken);
  const toke = await tokenService.getByToken(refreshToken);

  if (!userData || !toke) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData);

  await generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToket = jwtService.sign();
  const refreshToken = jwtService.sign();

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookies('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToket,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verify(refreshToken);

  if (!userData || !refreshToken) {
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
