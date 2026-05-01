import bcrypt from 'bcrypt';
import { v4 as uuid4 } from 'uuid';
import { usersRepository } from '../entity/users.repository.js';
import { userService } from '../services/user.service.js';
import { mailer } from '../utils/mailer.js';
import { jwt } from '../utils/jwt.js';
import { tokensRepository } from '../entity/tokens.repository.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
    name: userService.validateName(name),
  };

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const existUser = await usersRepository.getByEmail(email);

  if (existUser) {
    return res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });
  }

  const activationToken = uuid4();

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await usersRepository.create({
    name,
    email,
    password: hashedPassword,
    activationLink: activationToken,
  });

  await mailer.sendActivationLink(email, activationToken);

  return res.status(201).json({
    user: userService.normalize(user),
  });
};

const sendAuthentication = async (res, user) => {
  const userData = await userService.normalize(user);
  const accessToken = await jwt.generateAccessToken(userData);
  const refreshToken = await jwt.generateRefreshToken(userData);

  await tokensRepository.deleteByUserId(user.id);

  await tokensRepository.create(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
    redirectTo: '/profile',
  });
};

const activate = async (req, res) => {
  const { email, token } = req.params;

  const user = await usersRepository.getByEmail(email);

  if (!user || user.activationLink !== token) {
    return res.status(400).json({
      message: 'Invalid activation link',
    });
  }

  await usersRepository.activate(email);

  const newUser = await usersRepository.getByEmail(email);

  await sendAuthentication(res, newUser);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepository.getByEmail(email);

  if (!user) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  if (!user.isActivated) {
    return res.status(403).json({
      message: 'Please activate your account first. Check your email',
    });
  }

  await sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';

  if (!refreshToken) {
    return res.status(401).json({
      message: 'No refresh token',
    });
  }

  const userData = jwt.validateRefreshToken(refreshToken);

  if (!userData) {
    res.clearCookie('refreshToken');

    res.status(401).json({
      message: 'Invalid token',
    });

    return;
  }

  const token = await tokensRepository.getByToken(refreshToken);

  if (!token) {
    res.clearCookie('refreshToken');

    res.status(401).json({
      message: 'Token not found in DB',
    });

    return;
  }

  const user = await usersRepository.getByEmail(userData.email);

  if (!user) {
    res.clearCookie('refreshToken');

    res.status(401).json({
      message: 'User not found',
    });

    return;
  }

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);

  if (userData?.id) {
    await tokensRepository.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const user = await usersRepository.getByEmail(email);

  if (user) {
    const resetToken = uuid4();

    await usersRepository.setResetToken(email, resetToken);
    await mailer.sendResetLink(email, resetToken);
  }

  res.json({
    message: 'If email exists, a reset link has been sent.',
    redirectTo: '/login',
  });
};

export const resetPassword = async (req, res) => {
  const { email, token } = req.params;
  const { password, confirmation } = req.body;

  const hasPasswordError = await userService.validatePassword(password);

  if (hasPasswordError) {
    return res.status(400).json({
      errors: { password: hasPasswordError },
      message: 'Validation error',
    });
  }

  if (password !== confirmation) {
    return res.status(400).json({
      errors: { confirmation: 'Passwords do not match' },
      message: 'Validation error',
    });
  }

  const user = await usersRepository.getByEmail(email);

  if (!user || !user.resetToken || user.resetToken !== token) {
    return res.status(404).json({
      message: 'Invalid reset link',
    });
  }

  const isSamePassword = await bcrypt.compare(password, user.password);

  if (isSamePassword) {
    return res.status(400).json({
      errors: {
        newPassword: 'New password must be different from current password',
      },
      message: 'Validation error',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await usersRepository.updatePassword(user.id, hashedPassword);

  await usersRepository.setResetToken(email, null);

  res.json({
    message: 'Password has been updated successfully',
    redirectTo: '/login',
  });
};

const getAll = async (req, res) => {
  const users = await usersRepository.getAllActive();

  res.json(users.map(userService.normalize));
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
  getAll,
};
