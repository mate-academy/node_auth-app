import bcrypt from 'bcrypt';

import { jwt } from '../utils/jwt.js';
import { mailer } from '../utils/mailer.js';
import { ApiError } from '../exceptions/api.error.js';

import { TokenType, User } from '@prisma/client';
import { NormalizedUser } from '../types/NormalizedUser.js';

import { userService } from './user.service.js';
import { userRepository } from '../entity/user.repository.js';
import { tokenRepository } from '../entity/token.repository.js';
import { tokenService } from './token.service.js';

async function register(
  name: string,
  email: string,
  password: string,
): Promise<NormalizedUser> {
  const errors = {
    name: userService.validateName(name),
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const existedUser = await userRepository.getByEmail(email);

  if (existedUser) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = tokenService.generate();
  const hashedPassword = await userService.hashPassword(password);

  await mailer.sendActivationLink(email, activationToken);

  const user = await userRepository.create(name, email, hashedPassword);

  await tokenService.create(user.id, activationToken, TokenType.activation);

  return userService.normalize(user);
}

async function login(email: string, password: string): Promise<NormalizedUser> {
  const user = await userRepository.getByEmail(email);

  if (!user) {
    throw ApiError.unauthorized('Invalid credentials', {
      email: 'User not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid credentials', {
      password: 'Invalid password',
    });
  }

  const token = await tokenService.getByUserId(user.id, TokenType.activation);

  if (token) {
    throw ApiError.unauthorized('Account is not activated');
  }

  return userService.normalize(user);
}

async function activate(activationToken: string): Promise<NormalizedUser> {
  const token = await tokenService.getByToken(activationToken);

  if (!token) {
    throw ApiError.notFound();
  }

  await tokenService.deleteById(token.id);
  const activatedUser = await userRepository.getById(token.userId);

  if (!activatedUser) {
    throw ApiError.notFound();
  }

  return userService.normalize(activatedUser);
}

async function refresh(refreshToken: string): Promise<NormalizedUser> {
  const extractedData = jwt.validateRefreshToken(refreshToken) as
    | NormalizedUser
    | undefined;

  if (!refreshToken || !extractedData) {
    throw ApiError.unauthorized('Invalid token');
  }

  const user = await userRepository.getByEmail(extractedData.email);

  if (!user) {
    throw ApiError.unauthorized('Invalid token');
  }

  return userService.normalize(user);
}

async function logout(refreshToken: string): Promise<void> {
  const userData = jwt.validateRefreshToken(refreshToken) as
    | NormalizedUser
    | undefined;

  if (userData) {
    await tokenRepository.deleteByUserId(userData.id, TokenType.refresh);
  }
}

async function requestPasswordReset(email: string): Promise<void> {
  const user = await userRepository.getByEmail(email);

  if (!user) {
    throw ApiError.unauthorized('Invalid credentials', {
      email: 'User not found',
    });
  }

  const resetToken = tokenService.generate();

  await mailer.sendResetPasswordLink(email, resetToken);
  await tokenService.create(user.id, resetToken, TokenType.resetPassword);
}

async function resetPassword(
  resetToken: string,
  newPassword: string,
  passwordConfirmation: string,
): Promise<NormalizedUser> {
  if (!resetToken) {
    throw ApiError.unauthorized('Token is required');
  }

  const errors: Record<string, string> = {};
  const validationError = userService.validatePassword(newPassword);

  if (validationError) {
    errors.newPassword = validationError;
  }

  if (!passwordConfirmation) {
    errors.passwordConfirmation = 'Password confirmation is required';
  } else if (newPassword !== passwordConfirmation) {
    errors.passwordConfirmation =
      'Password confirmation does not match the new password';
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Invalid credentials', errors);
  }

  const token = await tokenService.getByToken(resetToken);

  if (!token) {
    throw ApiError.unauthorized('Invalid token');
  }

  const user = await userRepository.getById(token.userId);

  if (!user) {
    throw ApiError.unauthorized('Invalid token');
  }

  const updatedUser = await userRepository.changePassword(
    user.email,
    await userService.hashPassword(newPassword),
  );

  await tokenService.deleteById(token.id);

  return userService.normalize(updatedUser);
}

async function requestEmailChange(
  user: User,
  password: string,
  newEmail: string,
): Promise<void> {
  const errors = {
    newEmail: userService.validateEmail(newEmail),
  };

  if (newEmail === user.email) {
    errors.newEmail = 'New email must be different from the current one.';
  }

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Invalid credentials', errors);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid credentials', {
      password: 'Invalid password',
    });
  }

  const existedUser = await userRepository.getByEmail(newEmail);
  if (existedUser) {
    throw ApiError.unauthorized('Invalid credentials', {
      newEmail: 'Email is already taken',
    });
  }

  const existedToken = await tokenRepository.getByUserId(
    user.id,
    TokenType.changeEmail,
  );

  if (existedToken) {
    if (existedToken.payload === newEmail) {
      await mailer.sendChangeEmailLink(newEmail, existedToken.token);
      return;
    }

    await tokenRepository.deleteById(existedToken.id);
  }

  let token = await tokenRepository.getByPayload(newEmail);

  if (token) {
    if (token.userId === user.id) {
      await mailer.sendChangeEmailLink(newEmail, token.token);
      return;
    }

    await tokenRepository.deleteById(token.id);
  }

  const changeEmailToken = tokenService.generate();

  token = await tokenService.create(
    user.id,
    changeEmailToken,
    TokenType.changeEmail,
    newEmail,
  );

  await mailer.sendChangeEmailLink(newEmail, changeEmailToken);
}

async function changeEmail(changeEmailToken: string): Promise<NormalizedUser> {
  const token = await tokenService.getByToken(changeEmailToken);

  if (!token || !token.payload) {
    throw ApiError.notFound();
  }

  const user = await userRepository.getById(token.userId);

  if (!user) {
    throw ApiError.notFound();
  }

  const email = user.email;
  const newEmail = token.payload;
  const newUser = await userRepository.changeEmail(token.userId, newEmail);

  await tokenRepository.deleteById(token.id);
  await mailer.sendEmailChangeNotification(email, newEmail);

  return userService.normalize(newUser);
}

export const authService = {
  login,
  logout,
  refresh,
  register,
  activate,

  resetPassword,
  requestPasswordReset,

  changeEmail,
  requestEmailChange,
};
