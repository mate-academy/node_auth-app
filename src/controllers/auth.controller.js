import { User } from '../models/User.model.js';
import { authService } from '../services/auth.service.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { ApiError } from '../exeptetion/apiError.js';
import bcrypt from 'bcrypt';

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  const emailPatern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPatern.test(value)) {
    return 'Email is not good';
  }
};

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'password must have 6 characters';
  }
};

const registration = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('wrong email or password', {
      email: 'wrong email or password',
      password: 'wrong email or password',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await authService.register({ name, email, password: hashedPassword });

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const user = await authService.activateUser();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.findByEmail(email);

  if (!email) {
    throw ApiError.badRequest('wrong email', {
      email: 'wrong email',
    });
  }

  const isValidPassword = bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw ApiError.badRequest('wrong password', {
      password: 'wrong password',
    });
  }

  generateTokens(res, user);
};

const refresh = (req, res) => {
  const { refreshToken } = req.cookies;
  const user = jwtService.verifyRefresh(refreshToken);
  const token = tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalUser = authService.normalized(user);
  const accesToken = jwtService.sign(normalUser);
  const refreshToken = jwtService.signRefresh(normalUser);

  await tokenService.save(normalUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  res.send({
    user: normalUser,
    accesToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const user = jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(user.id);

  res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.badRequest('wrong email');
  }

  const resetToken = jwtService.sign(user);
  user.resetToken = resetToken;
  await user.save();

  const href = `${process.env.CLIENT_HOST}/auth/reset/${resetToken}`;
  const html = `
  <h1>Click for reset password</h1>
  <a href="${href}">${href}</a>
`;

  await emailService.sendActivationEmail(email, html);

  res.status(201).send({ message: 'Check your email' });
};

const verifyResetToken = async (req, res) => {
  const { resetToken } = req.params;

  if (!resetToken) {
    throw ApiError.badRequest('Something went wrong');
  }

  const payload = jwtService.verify(resetToken, process.env.JWT_KEY);
  const user = await User.findByPk(payload.id);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  user.resetToken = resetToken;
  await user.save();
};

const resetPassword = async (req, res) => {
  const { confirmPassword, newPassword } = req.body;
  const { resetToken } = req.params;

  if (!resetToken) {
    throw ApiError.badRequest('Something went wrong');
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const isGoodToken = jwtService.verify(resetToken, process.env.JWT_KEY);

  if (!isGoodToken) {
    throw ApiError.badRequest('Time of the session gone');
  }

  const user = await User.findByPk(isGoodToken.id);

  if (resetToken !== user.resetToken) {
    throw ApiError.badRequest('Something went wrong');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetToken = null;

  await user.save();
};

export const authController = {
  registration,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyResetToken,
};
