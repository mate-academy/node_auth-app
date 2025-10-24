/* eslint-disable no-console */
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { ApiError } from '../exeptions/api.error.js';

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

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 2) {
    return 'At least 2 characters';
  }
}

const generateTokens = async (user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(user.id, refreshToken);

  return { normalizedUser, accessToken, refreshToken };
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    name: validateName(name),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('Validation failed', errors);
  }

  const user = await userService.register({ name, email, password });
  const { normalizedUser, accessToken, refreshToken } =
    await generateTokens(user);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: false,
  });

  return res.json({
    message: 'Registration successful. Check your email to activate account.',
    user: normalizedUser,
    accessToken,
  });
};

export const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await userService.activate(activationToken);
  const { normalizedUser, accessToken, refreshToken } =
    await generateTokens(user);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: false,
  });

  return res.json({
    message: 'Account successfully activated!',
    user: normalizedUser,
    accessToken,
    refreshToken,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.login(email, password);
  const { normalizedUser, accessToken, refreshToken } =
    await generateTokens(user);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: false,
  });

  return res.json({ user: normalizedUser, accessToken });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  const tokenFromDb = await tokenService.getByToken(refreshToken);

  if (!tokenFromDb) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);

  return res.json({ user: normalizedUser, accessToken, refreshToken });
};

export const logout = async (req, res) => {
  await tokenService.remove(req.user.id);
  res.clearCookie('refreshToken');

  return res.sendStatus(204);
};

export const requestReset = async (req, res) => {
  const { email } = req.body;
  const error = validateEmail(email);

  if (error) {
    throw ApiError.badRequest('Bad request', { email: error });
  }

  await userService.requestPasswordReset(email);

  return res.json({
    message: 'If that email exists, you’ll get a reset link soon.',
  });
};

export const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res
      .status(400)
      .json({ message: 'Both password and confirmation are required' });
  }

  await userService.resetPassword(resetToken, password, confirmPassword);
  res.clearCookie('refreshToken');

  return res.json({ message: 'Password has been reset successfully' });
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  const result = await userService.updateProfile(userId, data);

  console.log('user.toJSON()', result.user);

  return res.json(result);
};
