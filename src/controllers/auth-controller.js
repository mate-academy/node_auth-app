import { ApiError } from '../exceptions.js/api-errors.js';
import {
  compareUserPassword,
  consumeActivationToken,
  createUser,
  findActivatedUser,
  findByPasswordResetToken,
  findUserByActiveToken,
  generateActiveToken,
  generatePasswordResetToken,
  resetUserPassword,
  updateUserEmail,
  updateUserName,
  updateUserPassword,
} from '../services/users-service.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from '../services/jwt-services.js';
import { tokenService } from '../services/token-service.js';
import { sendActivationEmail, sendMail } from '../services/new-service.js';
import { User } from '../models/user.js';

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name) {
    throw ApiError.BadRequest('Name is required', {
      name: 'Name cannot be empty',
    });
  }

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError || passwordError) {
    throw ApiError.BadRequest('Bad request', {
      email: emailError,
      password: passwordError,
    });
  }

  const activationToken = generateActiveToken();
  const user = await createUser({
    name,
    email,
    password,
    activationToken,
  });

  await sendActivationEmail({ email, activationToken });

  return res.status(201).send({
    message:
      'User registered. Please check your email to activate the account.',
    user: { id: user.id, email: user.email },
  });
};

const activate = async (req, res, next) => {
  const { activationToken } = req.params;

  const user = await findUserByActiveToken(activationToken);

  if (!user) {
    throw ApiError.NotFound();
  }

  await consumeActivationToken(user);

  return res.redirect(`${process.env.URL_CLIENT}/profile`);
};

const sendAuth = async (user, res) => {
  const accessToken = createAccessToken({ id: user.id, email: user.email });
  const refreshToken = createRefreshToken({ id: user.id, email: user.email });

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  return res.send({
    message: 'Authenticated successfully',
    accessToken,
    user: { id: user.id, email: user.email },
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.NotFound();
  }

  if (user.activationToken) {
    throw ApiError.BadRequest('Please activate your account before logging in');
  }

  if (!(await compareUserPassword(password, user))) {
    throw ApiError.Unauthorized();
  }

  return sendAuth(user, res);
};

const logout = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  const userData = verifyRefreshToken(refreshToken);

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.clearCookie('refreshToken');

  return res.send({ message: 'Logged out successfully' });
};

const refresh = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  const userData = verifyRefreshToken(refreshToken);

  if (userData === null) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await findActivatedUser(userData.email);

  return sendAuth(user, res);
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await findActivatedUser(email);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const resetToken = await generatePasswordResetToken(user);

  const link = `${process.env.URL_CLIENT}/reset-password/${resetToken}`;

  await sendMail({
    to: email,
    subject: 'Password reset',
    html: `<p>Click the link to reset password:</p><a href="${link}">${link}</a>`,
  });

  return res.send({ message: 'Password reset email sent' });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmation } = req.body;

  if (password !== confirmation) {
    throw ApiError.BadRequest('Passwords do not match');
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    throw ApiError.BadRequest(passwordError);
  }

  const user = await findByPasswordResetToken(token);

  if (!user) {
    throw ApiError.BadRequest('Invalid or expired token');
  }

  await resetUserPassword(user, password);

  return res.send({ message: 'Password reset successful, you can login now' });
};

const getProfile = async (req, res) => {
  const user = req.user;

  return res.send({ id: user.id, name: user.name, email: user.email });
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const user = await updateUserName(req.user, name);

  return res.send({
    message: 'Name updated',
    user: { id: user.id, name: user.name },
  });
};

const updateEmail = async (req, res) => {
  const { email } = req.body;
  const user = await updateUserEmail(req.user, email);

  return res.send({
    message: 'Email updated',
    user: { id: user.id, email: user.email },
  });
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmation } = req.body;

  if (newPassword !== confirmation) {
    throw ApiError.BadRequest('Passwords do not match');
  }

  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.BadRequest(passwordError);
  }

  await updateUserPassword(req.user, currentPassword, newPassword);

  return res.send({ message: 'Password updated successfully' });
};

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  resetPassword,
  requestPasswordReset,
  updateEmail,
  updateName,
  updatePassword,
  getProfile,
};
