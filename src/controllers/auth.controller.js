import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }

  return null;
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'Password must be at least 6 characters';
  }

  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/\d/.test(value)) {
    return 'Password must contain at least one digit';
  }

  return null;
}

async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: !name ? 'Name is required' : null,
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPassword);

  res.status(201).send({
    message: 'Activation email has been sent',
  });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    throw ApiError.notFound({
      activationToken: 'Activation token is invalid',
    });
  }

  user.activationToken = null;
  user.isActivated = true;
  await user.save();

  await generateTokens(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (!user.isActivated) {
    throw ApiError.badRequest('Please activate your email first');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.unauthorized();
  }

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.sendStatus(204);
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.clearCookie('refreshToken');

  return res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const emailError = validateEmail(email);

  if (emailError) {
    throw ApiError.badRequest('Bad request', {
      email: emailError,
    });
  }

  await userService.createResetToken(email);

  res.send({
    message: 'If the email exists, reset instructions were sent',
  });
};

const checkResetToken = async (req, res) => {
  const { resetToken } = req.params;

  const user = await userService.findByResetToken(resetToken);

  if (!user) {
    throw ApiError.notFound({
      resetToken: 'Reset token is invalid',
    });
  }

  if (
    !user.resetTokenExpiresAt ||
    new Date(user.resetTokenExpiresAt) < new Date()
  ) {
    throw ApiError.badRequest('Reset token expired');
  }

  res.send({
    message: 'Token is valid',
  });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  const passwordError = validatePassword(password);

  if (passwordError) {
    throw ApiError.badRequest('Bad request', {
      password: passwordError,
    });
  }

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Bad request', {
      confirmPassword: 'Passwords do not match',
    });
  }

  const user = await userService.findByResetToken(resetToken);

  if (!user) {
    throw ApiError.notFound({
      resetToken: 'Reset token is invalid',
    });
  }

  if (
    !user.resetTokenExpiresAt ||
    new Date(user.resetTokenExpiresAt) < new Date()
  ) {
    throw ApiError.badRequest('Reset token expired');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpiresAt = null;

  await user.save();

  res.send({
    message: 'Password was changed successfully',
  });
};

const getProfile = async (req, res) => {
  const user = await userService.findById(req.user.id);

  if (!user) {
    throw ApiError.unauthorized();
  }

  res.send({
    user: userService.normalize(user),
  });
};

const updateName = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest('Bad request', {
      name: 'Name is required',
    });
  }

  const user = await userService.findById(req.user.id);

  if (!user) {
    throw ApiError.unauthorized();
  }

  user.name = name;
  await user.save();

  res.send({
    user: userService.normalize(user),
  });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await userService.findById(req.user.id);

  if (!user) {
    throw ApiError.unauthorized();
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw ApiError.badRequest('Bad request', {
      oldPassword: 'Old password is incorrect',
    });
  }

  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.badRequest('Bad request', {
      newPassword: passwordError,
    });
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Bad request', {
      confirmPassword: 'Passwords do not match',
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({
    message: 'Password updated successfully',
  });
};

const updateEmail = async (req, res) => {
  const { newEmail, password } = req.body;

  const emailError = validateEmail(newEmail);

  if (emailError) {
    throw ApiError.badRequest('Bad request', {
      newEmail: emailError,
    });
  }

  const user = await userService.findById(req.user.id);

  if (!user) {
    throw ApiError.unauthorized();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Bad request', {
      password: 'Password is incorrect',
    });
  }

  const existingUser = await userService.findByEmail(newEmail);

  if (existingUser && existingUser.id !== user.id) {
    throw ApiError.badRequest('Bad request', {
      newEmail: 'Email is already in use',
    });
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await emailService.sendEmailChangedNotification(oldEmail, newEmail);

  res.send({
    user: userService.normalize(user),
  });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  checkResetToken,
  resetPassword,
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};
