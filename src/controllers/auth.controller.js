import 'dotenv/config';
import { normalizeUser } from '../dto/user.dto.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { jwt } from '../utils/jwt.util.js';
import { mailer } from '../utils/mailer.js';
import { passwordUtils } from '../utils/password.util.js';
import { authService } from '../services/auth.service.js';
import { ApiError } from '../exeptions/api.error.js';

const isProduction = process.env.NODE_ENV === 'production';

const register = async (req, res) => {
  const { email, password, name } = req?.body || {};

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
    name: userService.validateUserName(name),
  };

  const isErrorExists = Object.values(errors).some(Boolean);

  if (isErrorExists) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const existingUser = await userService.getUserByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const hashedPassword = await passwordUtils.getHashedPassword(password);
  const activationToken = authService.generateActivationToken();

  const user = await userService.createUser({
    email,
    password: hashedPassword,
    name,
    activationToken,
  });

  await mailer.sendActivationLink(email, activationToken);

  res.status(201).send(normalizeUser(user));
};

const sendAuthentication = async (res, user) => {
  const userData = normalizeUser(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  await tokenService.deleteByUserId(userData.id);
  await tokenService.create({ userId: userData.id, refreshToken });

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: isProduction,
  });

  res.send({
    user: userData,
    accessToken,
  });
};

const activate = async (req, res) => {
  const { email, activationToken } = req.params;

  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw ApiError.notFound('No such email exists');
  } else if (user.activationToken === null) {
    throw ApiError.badRequest('User account already active');
  } else if (user.activationToken !== activationToken) {
    throw ApiError.badRequest('Incorrect activation link');
  }

  const activatedUser = await userService.activate(email);

  await sendAuthentication(res, activatedUser);
};

const login = async (req, res) => {
  const { email, password } = req.body || {};

  const user = await userService.getUserByEmail(email);
  const isPasswordCorrect = await passwordUtils.comparePassword({
    hashedPassword: user?.password || '',
    password,
  });

  if (!user || !isPasswordCorrect) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (user.activationToken) {
    throw ApiError.forbidden();
  }

  await sendAuthentication(res, user);
};

const resendActivationLink = async (req, res) => {
  const { email } = req.body || {};

  const errors = {
    email: userService.validateEmail(email),
  };

  const isErrorExists = Object.values(errors).some(Boolean);

  if (isErrorExists) {
    throw ApiError.badRequest('User account already active', errors);
  }

  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw ApiError.notFound('Validation error', {
      email: 'No such user with this email',
    });
  }

  if (!user.activationToken) {
    throw ApiError.badRequest('User is already active');
  }

  const isResendAvaliable = authService.canResendActivation(user);

  if (!isResendAvaliable) {
    throw ApiError.tooManyRequests();
  }

  const activationToken = authService.generateActivationToken();
  await userService.updateUser(user.id, {
    activationToken,
    lastActivationEmailSentAt: new Date(),
  });

  await mailer.sendActivationLink(email, activationToken);

  res.status(200).send({
    message: 'The email was sent',
  });
};

const refresh = async (req, res) => {
  const { refreshToken = null } = req?.cookies || {};
  const userDataFromToken = jwt.validateRefreshToken(refreshToken);
  const user = await userService.getUserById(userDataFromToken?.id);
  const token = await tokenService.getByToken(refreshToken);

  if (!userDataFromToken || !user || !token || user.id !== token.userId) {
    res.clearCookie('refreshToken');

    throw ApiError.unauthorized();
  }

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const { refreshToken = null } = req?.cookies || {};

  if (refreshToken) {
    await tokenService.deleteByToken(refreshToken);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const passwordResetRequest = async (req, res) => {
  const { email } = req?.body || {};

  const errors = {
    email: userService.validateEmail(email),
  };

  const isErrorExists = Object.values(errors).some(Boolean);

  if (isErrorExists) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await userService.getUserByEmail(email);

  if (!user) {
    return res.status(200).send({
      message: 'If the email exists, reset instructions were sent.',
    });
  }

  const resetPasswordToken = authService.generateActivationToken();
  await userService.updateUser(user.id, {
    resetPasswordToken,
    resetPasswordExpiresAt: authService.getPasswordExpiresAt(),
  });

  await mailer.sendResetPasswordLink(email, resetPasswordToken);

  res.status(200).send({
    message: 'If the email exists, reset instructions were sent.',
  });
};

const passwordReset = async (req, res) => {
  const { token, newPassword } = req.body || {};

  const errors = {
    password: userService.validatePassword(newPassword),
  };

  const isErrorExists = Object.values(errors).some(Boolean);

  if (isErrorExists) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await userService.getUserByResetPasswordToken(token);

  if (!user) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  if (
    token !== user.resetPasswordToken ||
    user.resetPasswordExpiresAt < Date.now()
  ) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  const hashedPassword = await passwordUtils.getHashedPassword(newPassword);

  await userService.updateUser(user.id, {
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpiresAt: null,
    passwordChangedAt: new Date(),
  });
  await tokenService.deleteByUserId(user.id);

  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  resendActivationLink,
  refresh,
  logout,
  passwordResetRequest,
  passwordReset,
};
