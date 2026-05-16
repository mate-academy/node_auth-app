import { authValidator } from './auth.validator.js';
import { usersRepository } from '../users/users.repository.js';
import { usersService, type NormalizedUser } from '../users/users.service.js';
import { comparePasswords, hashPassword } from '../../utils/password.js';
import { generateToken } from '../../utils/token.js';
import { AppError } from '../../errors/AppError.js';
import { generateAccessToken } from '../../utils/jwt.js';
import { mailer } from '../../utils/mailer.js';

type ForgotPasswordInput = {
  email: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthResponse = {
  user: NormalizedUser;
  accessToken: string;
};

const register = async (input: unknown): Promise<NormalizedUser> => {
  const validationResult = authValidator.validateRegisterInput(input);

  if (!validationResult.isValid) {
    throw new AppError(400, 'Validation failed', validationResult.errors);
  }

  const { name, email, password } = input as RegisterInput;

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await usersRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError(409, 'Email already in use');
  }

  const passwordHash = await hashPassword(password);
  const activationToken = generateToken();

  const newUser = await usersRepository.create({
    name: normalizedName,
    email: normalizedEmail,
    passwordHash,
    activationToken,
  });

  await mailer.sendActivationLink(normalizedEmail, activationToken);

  return usersService.normalize(newUser);
};

const activate = async (token: string): Promise<NormalizedUser> => {
  if (!token.trim()) {
    throw new AppError(400, 'Activation token is required');
  }

  const user = await usersRepository.findByActivationToken(token);

  if (!user) {
    throw new AppError(404, 'Invalid activation token');
  }

  const activatedUser = await usersRepository.activate(user.id);

  return usersService.normalize(activatedUser);
};

const login = async (input: unknown): Promise<AuthResponse> => {
  const validationResult = authValidator.validateLoginInput(input);

  if (!validationResult.isValid) {
    throw new AppError(400, 'Validation failed', validationResult.errors);
  }

  const { email, password } = input as LoginInput;

  const normalizedEmail = email.trim().toLowerCase();

  const user = await usersRepository.findByEmail(normalizedEmail);

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isPasswordValid = await comparePasswords(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (!user.isActivated) {
    throw new AppError(403, 'Account is not activated');
  }

  const normalizedUser = usersService.normalize(user);

  const accessToken = generateAccessToken(normalizedUser);

  return {
    user: normalizedUser,
    accessToken,
  };
};

const forgotPassword = async (input: unknown): Promise<void> => {
  const validationResult = authValidator.validateForgotPasswordInput(input);

  if (!validationResult.isValid) {
    throw new AppError(400, 'Validation failed', validationResult.errors);
  }

  const { email } = input as ForgotPasswordInput;

  const normalizedEmail = email.trim().toLowerCase();

  const user = await usersRepository.findByEmail(normalizedEmail);

  if (!user) {
    return;
  }

  const resetToken = generateToken();

  const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

  await usersRepository.setPasswordResetToken(
    user.id,
    resetToken,
    resetTokenExpires,
  );

  await mailer.sendPasswordResetLink(normalizedEmail, resetToken);
};

const resetPassword = async (token: string, input: unknown): Promise<void> => {
  if (!token.trim()) {
    throw new AppError(400, 'Reset token is required');
  }

  const validationResult = authValidator.validateResetPasswordInput(input);

  if (!validationResult.isValid) {
    throw new AppError(400, 'Validation failed', validationResult.errors);
  }

  const { password } = input as { password: string };

  const user = await usersRepository.findByPasswordResetToken(token);

  if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    throw new AppError(400, 'Invalid or expired reset token');
  }

  const passwordHash = await hashPassword(password);

  await usersRepository.updatePassword(user.id, passwordHash);

  await usersRepository.clearPasswordResetToken(user.id);
};

export const authService = {
  register,
  activate,
  login,
  forgotPassword,
  resetPassword,
};
