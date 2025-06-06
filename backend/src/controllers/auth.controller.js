import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation.utils.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.send({ message: 'OK' });
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  await userService.passwordReset(email);

  res.send({ message: 'OK' });
};

const passwordReset = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ where: { activationToken: token } });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const hashedPass = await bcrypt.hash(password, 10);
  user.password = hashedPass;
  user.activationToken = null;
  await user.save();

  res.send({ message: 'Password has been reset successfully' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.activationToken = null;
  await user.save();

  const { accessToken, user: normalizedUser } = await generateTokens(res, user);
  res.send({
    accessToken,
    user: normalizedUser,
    redirectUrl: `${process.env.CLIENT_HOST}/profile`,
  });
};

async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  return { accessToken, user: normalizedUser };
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }
  if (user.activationToken !== null) {
    throw ApiError.badRequest('Activate your email');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const { accessToken, user: normalizedUser } = await generateTokens(res, user);
  res.send({ accessToken, user: normalizedUser });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);
  const { accessToken, user: normalizedUser } = await generateTokens(res, user);
  res.send({ accessToken, user: normalizedUser });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const googleAuth = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw ApiError.unauthorized('Google authentication failed');
  }

  const { accessToken } = await generateTokens(res, user);
  res.redirect(`${process.env.CLIENT_HOST}/#/google-success/${accessToken}`);
};

const githubAuth = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw ApiError.unauthorized('GitHub authentication failed');
  }

  const { accessToken } = await generateTokens(res, user);
  res.redirect(`${process.env.CLIENT_HOST}/#/github-success/${accessToken}`);
};

const facebookAuth = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw ApiError.unauthorized('Facebook authentication failed');
  }

  const { accessToken } = await generateTokens(res, user);
  res.redirect(`${process.env.CLIENT_HOST}/#/facebook-success/${accessToken}`);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  passwordReset,
  googleAuth,
  githubAuth,
  facebookAuth,
};
