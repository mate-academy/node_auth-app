import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { jwtService } from '../services/jwt.service.js';
import { userService } from '../services/user.service.js';
import { tokenService } from '../services/token.service.js';

const register = async (req, res) => {
  const { email, password, name } = req.body;

  await userService.register(email, password, name);

  res.status(200).send({ message: 'Please, check your email' });
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  await userService.resetEmail(email);

  res.status(200).json({ message: 'Check your email' });
};

const passwordReset = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  await userService.resetPassword(resetToken, password);

  res.status(200).send({ message: 'Password successfully reset' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.status(404).send({ message: 'Invalid email activation token' });

    return;
  }

  const normalizedUser = userService.normalize(user);

  user.activationToken = null;
  user.isVerified = true;
  await user.save();

  res.send(normalizedUser);
};

async function generateTokens(res, user) {
  // normalized to transfer only id and email
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  // save or create a new refresh token in db
  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    // 7 days in ms
    maxAge: 7 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  await userService.login(user, password);

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  // checks validity of refresh token
  const userData = jwtService.verifyRefresh(refreshToken);
  // checks for refresh token in db
  const token = await tokenService.getByToken(refreshToken);

  if (!token || !userData) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, userData);
};

export const authController = {
  register,
  requestPasswordReset,
  passwordReset,
  activate,
  login,
  logout,
  refresh,
};
