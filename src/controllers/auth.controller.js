import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';

const register = async (req, res) => {
  const { email, password, name } = req.body;

  userService.validateDataForRegistration({ email, password });

  const hashedPass = await bcrypt.hash(password, 10);
  const newUser = await userService.register({
    email,
    password: hashedPass,
    name,
  });

  res.send(newUser);
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

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Please confirm registration on email');
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
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
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(user.id);
};

const sendResetPasswordLink = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);

  const successMessage = 'Reset link has been sent';

  if (!user) {
    return res.status(200).json({ message: successMessage });
  }

  await userService.createResetPasswordToken(user);

  res.status(200).json({ message: successMessage });
};

const resetPasswordConfirmation = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params.token;

  const passwordError = userService.validatePassword(password);

  if (passwordError) {
    throw ApiError.badRequest('Invalid password');
  }

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  await userService.changeUserPassword(user, password);

  res.status(200).json({ message: 'Password updated successfully' });
};

const updateName = async (req, res) => {
  const { name, email } = req.body;

  if (!name || name.length < 3) {
    throw ApiError.badRequest('Name must be at least 3 characters long');
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  user.name = name;
  await user.save();

  res.status(201).json({ message: 'Name updated successfully' });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword, email } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw ApiError.badRequest('All fields are required');
  }

  const errors = {
    newPassword: userService.validatePassword(newPassword),
    confirmPassword: userService.validatePassword(confirmPassword),
  };

  if (errors.newPassword || errors.confirmPassword) {
    throw ApiError.badRequest('Bad request', errors);
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest("Password doesn't match");
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordMatch) {
    throw ApiError.badRequest('Old password is incorrect');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(201).json({ message: 'Password updated successfully' });
};

const updateEmail = async (req, res) => {
  const { password, newEmail, oldEmail } = req.body;

  if (!password || !newEmail || !oldEmail) {
    throw ApiError.badRequest('All fields are required');
  }

  const user = await userService.findByEmail(oldEmail);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  await userService.updateEmail({
    user,
    password,
    newEmail,
    oldEmail,
  });

  res.status(200).json({ message: 'Email updated successfully' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  sendResetPasswordLink,
  resetPasswordConfirmation,
  updateName,
  updatePassword,
  updateEmail,
};
