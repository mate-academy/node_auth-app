const service = require('../users/user.service');
const emailService = require('../email/email.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { compareData, hashData } = require('../utils/hash');
const { sign, verify } = require('./token.service');
const encrypter = require('crypto');

require('dotenv').config();

const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await service.register({ name, email, password });

  await emailService.sendEmail({
    to: email,
    subject: 'Node App Authentication',
    text: `${process.env.HOST_ADDRESS}/auth/activate?email=${user.email}&token=${user.activationToken}`,
  });

  res.status(201).json(service.normalize(user));
});

const activate = catchAsync(async (req, res) => {
  const { email, token } = req.query;

  const user = await service.getByEmail(email);

  if (!user) {
    throw new AppError('There is no user with this email.', 400);
  }

  if (user.activationToken !== token) {
    throw new AppError('This user does not have this activation token.', 400);
  }

  await service.update(user.id, { activationToken: null });

  res.status(200).json({ message: 'Email is activated' });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await service.getByEmail(email);

  if (!user) {
    throw new AppError('There is no user with this email.', 400);
  }

  if (!(await compareData(password, user.password))) {
    throw new AppError('Passwords dont match.', 400);
  }

  if (user.activationToken) {
    throw new AppError('Please activate your email before logging in.', 403);
  }

  const token = sign(user.id, '24h');
  const refreshToken = sign(user.id, '30d');

  await service.update(user.id, { refreshToken });

  res.status(200).json({ token, refreshToken, user: service.normalize(user) });
});

const refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required.', 400));
  }

  let decoded;

  try {
    decoded = verify(refreshToken);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const user = await service.getById(decoded.id);

  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  if (user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid or expired refresh token.', 401));
  }

  const newAccessToken = sign(user.id, '24h');
  const newRefreshToken = sign(user.id, '30d');

  await service.update(user.id, { refreshToken: newRefreshToken });

  res.status(200).json({
    token: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

const logout = catchAsync(async (req, res) => {
  const userId = req.id;

  await service.update(userId, { refreshToken: null });

  res.status(200).json({ message: 'Logged out successfully.' });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await service.getByEmail(email);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const token = encrypter.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 30);

  await service.update(user.id, {
    resetToken: token,
    resetTokenExpiry: expires,
  });

  const resetLink = `${process.env.HOST_ADDRESS}/reset-password?email=${email}&token=${token}`;

  await emailService.sendEmail({
    to: email,
    subject: 'Reset Your Password',
    text: `Reset your password using this link: ${resetLink}`,
  });

  res.status(200).json({ message: 'Reset link sent if the email exists.' });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, token, password, confirmation } = req.body;

  if (password !== confirmation) {
    throw new AppError('Passwords do not match.', 400);
  }

  const user = await service.getByEmail(email);

  if (
    !user ||
    user.resetToken !== token ||
    new Date(user.resetTokenExpiry) < new Date()
  ) {
    throw new AppError('Invalid or expired token.', 400);
  }

  const hashed = await hashData(password);

  await service.update(user.id, {
    password: hashed,
    resetToken: null,
    resetTokenExpiry: null,
  });

  res
    .status(200)
    .json({ message: 'Password reset successful. You can now log in.' });
});

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
