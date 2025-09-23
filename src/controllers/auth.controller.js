import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import { v4 as uuidv4 } from 'uuid';
import { validate } from '../services/validate.service.js';

const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  const errors = {
    username: validate.validateUsername(username),
    email: validate.validateEmail(email),
    password: validate.validatePassword(password),
  };

  if (errors.email || errors.password || errors.username) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(username, email, hashedPass);
  res.send({ message: 'OK' });
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

  res.send(user);
};

async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);
  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);
  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Please activate the profile');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);
  await generateTokens(res, user);
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

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const emailError = validate.validateEmail(email);
  if (emailError) {
    throw ApiError.badRequest('Bad request', { email: emailError });
  }

  const user = await userService.findByEmail(email);
  if (!user) {
    throw ApiError.notFound('No such user');
  }

  const resetToken = uuidv4();

  await userService.saveResetToken(user.id, resetToken, Date.now() + 3600000);

  res.status(200);
  res.send({ message: 'Кeset link has been sent' });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }


  const passwordError = validate.validatePassword(password);
  if (passwordError) {
    throw ApiError.badRequest('Bad request', { password: passwordError });
  }

  const user = await userService.findByResetToken(token);
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.updatePassword(user.id, hashedPass);

  res.status(200);
  res.send({ message: 'Password successfully updated' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
