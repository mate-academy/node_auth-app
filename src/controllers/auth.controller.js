import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { profileService } from '../services/profile.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { tokenService } from '../services/token.service.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

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
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await profileService.register(name, email, hashedPassword);

  res.send({
    message: 'Registration successful. Please check your email for activation.',
  });
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

  await generateTokens(res, user);
  res.redirect(`/profile/${user.id}`);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await profileService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken) {
    throw ApiError.unauthorized('Please activate your profile');
  }

  await generateTokens(res, user);
  res.redirect(`/profile/${user.id}`);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await profileService.findByEmail(userData.email);

  await generateTokens(res, user);
};

async function generateTokens(res, user) {
  const normalizedUser = profileService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized('User not authorized');
  }

  await tokenService.remove(userData.id);

  res.clearCookie('refreshToken');

  return res.status(302).redirect('/login/');
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  await profileService.resetPassword(email);

  res.send({
    message: 'Password reset. Please check your email for confirmation.',
  });
};

const resetForm = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confPassword } = req.body;

  if (!password || !confPassword) {
    throw ApiError.badRequest('Enter new password');
  }

  if (password !== confPassword) {
    throw ApiError.badRequest('Confirmation password error');
  }

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetToken = null;

  await user.save();

  res.status(200).send('The password has been changed');
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetPassword,
  resetForm,
};
