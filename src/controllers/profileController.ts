import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { TokenType } from '../generated/prisma/enums.js';
import { prisma } from '../lib/prisma.js';
import { sendEmailChangeNotification } from '../services/mailService.js';

type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isActivated: boolean;
};

type UpdateNameRequestBody = {
  name?: unknown;
};

type UpdatePasswordRequestBody = {
  oldPassword?: unknown;
  newPassword?: unknown;
  confirmNewPassword?: unknown;
};

type UpdateEmailRequestBody = {
  newEmail?: unknown;
  confirmNewEmail?: unknown;
  password?: unknown;
};

const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

function validateEmail(value: string): string | null {
  const trimmedEmail = value.trim();

  if (!trimmedEmail) {
    return 'Email is required';
  }

  if (!emailPattern.test(trimmedEmail)) {
    return 'Email is not valid';
  }

  return null;
}

function validatePassword(value: string): string | null {
  if (!value.trim()) {
    return 'Password is required';
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }

  return null;
}

function validateName(value: string): string | null {
  const trimmedName = value.trim();

  if (!trimmedName) {
    return 'Name is required';
  }

  if (trimmedName.length < 3) {
    return 'Name must be at least 3 characters';
  }

  return null;
}

const getAuthenticatedUser = async (
  req: Request,
  res: Response,
): Promise<AuthenticatedUser | null> => {
  const refreshToken = req.cookies?.refreshToken;

  if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
    res.status(401).json({ message: 'Authentication is required' });

    return null;
  }

  const existingToken = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: TokenType.REFRESH_TOKEN,
    },
  });

  if (!existingToken) {
    res.clearCookie('refreshToken');
    res.status(401).json({ message: 'Authentication is required' });

    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: existingToken.userId,
    },
  });

  if (!existingUser) {
    res.clearCookie('refreshToken');
    res.status(401).json({ message: 'Authentication is required' });

    return null;
  }

  return existingUser;
};

const updateName = async (req: Request, res: Response): Promise<void> => {
  const currentUser = await getAuthenticatedUser(req, res);

  if (!currentUser) {
    return;
  }

  const { name } = (req.body ?? {}) as UpdateNameRequestBody;

  if (typeof name !== 'string') {
    res.status(400).json({ message: 'Name must be a string' });

    return;
  }

  const nameError = validateName(name);

  if (nameError) {
    res.status(400).json({ message: nameError });

    return;
  }

  const trimmedName = name.trim();
  const user = await prisma.user.update({
    where: {
      id: currentUser.id,
    },
    data: {
      name: trimmedName,
    },
  });

  res.status(200).json({
    message: 'Name updated successfully.',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      isActivated: user.isActivated,
    },
  });
};

const updatePassword = async (req: Request, res: Response): Promise<void> => {
  const currentUser = await getAuthenticatedUser(req, res);

  if (!currentUser) {
    return;
  }

  const { oldPassword, newPassword, confirmNewPassword } = (req.body ??
    {}) as UpdatePasswordRequestBody;

  if (typeof oldPassword !== 'string') {
    res.status(400).json({ message: 'Old password must be a string' });

    return;
  }

  if (typeof newPassword !== 'string') {
    res.status(400).json({ message: 'New password must be a string' });

    return;
  }

  if (typeof confirmNewPassword !== 'string') {
    res.status(400).json({ message: 'Confirm new password must be a string' });

    return;
  }

  const oldPasswordError = validatePassword(oldPassword);

  if (oldPasswordError) {
    res.status(400).json({ message: oldPasswordError });

    return;
  }

  const newPasswordError = validatePassword(newPassword);

  if (newPasswordError) {
    res.status(400).json({ message: newPasswordError });

    return;
  }

  const confirmPasswordError = validatePassword(confirmNewPassword);

  if (confirmPasswordError) {
    res.status(400).json({ message: confirmPasswordError });

    return;
  }

  if (newPassword !== confirmNewPassword) {
    res.status(400).json({ message: 'Passwords do not match' });

    return;
  }

  const isOldPasswordValid = await bcrypt.compare(
    oldPassword,
    currentUser.passwordHash,
  );

  if (!isOldPasswordValid) {
    res.status(401).json({ message: 'Old password is incorrect' });

    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id: currentUser.id,
    },
    data: {
      passwordHash,
    },
  });

  res.status(200).json({
    message: 'Password updated successfully.',
  });
};

const updateEmail = async (req: Request, res: Response): Promise<void> => {
  const currentUser = await getAuthenticatedUser(req, res);

  if (!currentUser) {
    return;
  }

  const { newEmail, confirmNewEmail, password } = (req.body ??
    {}) as UpdateEmailRequestBody;

  if (typeof newEmail !== 'string') {
    res.status(400).json({ message: 'New email must be a string' });

    return;
  }

  if (typeof confirmNewEmail !== 'string') {
    res.status(400).json({ message: 'Confirm new email must be a string' });

    return;
  }

  if (typeof password !== 'string') {
    res.status(400).json({ message: 'Password must be a string' });

    return;
  }

  const newEmailError = validateEmail(newEmail);

  if (newEmailError) {
    res.status(400).json({ message: newEmailError });

    return;
  }

  const confirmEmailError = validateEmail(confirmNewEmail);

  if (confirmEmailError) {
    res.status(400).json({ message: confirmEmailError });

    return;
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    res.status(400).json({ message: passwordError });

    return;
  }

  const trimmedNewEmail = newEmail.trim();
  const trimmedConfirmNewEmail = confirmNewEmail.trim();

  if (trimmedNewEmail !== trimmedConfirmNewEmail) {
    res.status(400).json({ message: 'Emails do not match' });

    return;
  }

  if (trimmedNewEmail === currentUser.email) {
    res.status(400).json({ message: 'New email must be different' });

    return;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    currentUser.passwordHash,
  );

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Password is incorrect' });

    return;
  }

  const userWithNewEmail = await prisma.user.findUnique({
    where: {
      email: trimmedNewEmail,
    },
  });

  if (userWithNewEmail) {
    res.status(409).json({ message: 'User with this email already exists' });

    return;
  }

  const previousEmail = currentUser.email;
  const user = await prisma.user.update({
    where: {
      id: currentUser.id,
    },
    data: {
      email: trimmedNewEmail,
    },
  });

  await sendEmailChangeNotification(previousEmail, trimmedNewEmail);

  res.status(200).json({
    message: 'Email updated successfully.',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      isActivated: user.isActivated,
    },
  });
};

export const profileController = {
  updateEmail,
  updateName,
  updatePassword,
};
