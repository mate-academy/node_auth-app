import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register({ email, password: hashedPass });
  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  user.activationToken = null;
  await user.save();

  const { accessToken, user: normalizedUser } = await generateTokens(res, user);

  res.json({ accessToken, user: normalizedUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Please activate your email');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const { accessToken, user: normalizedUser } = await generateTokens(res, user);

  res.json({ accessToken, user: normalizedUser });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unAuthorized();
  }

  const user = await userService.findByEmail(userData.email);
  const { accessToken, user: normalizedUser } = await generateTokens(res, user);

  res.json({ accessToken, user: normalizedUser });
};

export async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);
  const refreshToken = jwtService.signRefresh(normalizedUser);
  const accessToken = jwtService.sign(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  return { accessToken, user: normalizedUser };
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unAuthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  await user.save();

  await emailService.sendResetEmail(email, resetToken);
  res.send({ message: 'OK' });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ where: { resetToken: token } });

  if (!user) {
    throw ApiError.badRequest('Invalid token');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  await user.save();

  res.send({ message: 'OK' });
};

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  resetPassword,
  forgotPassword,
};
