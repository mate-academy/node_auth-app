import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient';
import {
  sendActivationEmail,
  sendEmailChangeConfirmation,
  sendPasswordResetEmail,
} from '../utils/sendEmail';
import { AppError } from '../utils/AppError';
import { hashPassword } from '../utils/hash';
import { UpdateProfileInput, UpdateProfileResult } from '../models/updateUser';
import {
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
} from '../utils/validation';

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
) => {
  const emailLower = email.toLowerCase();

  if (!validateEmail(emailLower)) {
    throw new AppError('Invalid email format', 400);
  }

  if (!validatePassword(password)) {
    throw new AppError(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
      400,
    );
  }

  if (!validatePasswordConfirmation(password, passwordConfirmation)) {
    throw new AppError('Passwords do not match', 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: emailLower },
  });
  if (existingUser)
    throw new AppError('User with this email already exists', 400);

  const passwordHash = await bcrypt.hash(password, 10);
  const activationToken = uuidv4();

  await prisma.user.create({
    data: {
      id: uuidv4(),
      name,
      email: emailLower,
      passwordHash,
      isActive: false,
      activationToken,
    },
  });

  await sendActivationEmail(emailLower, activationToken);
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 400);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 400);
  }

  if (!user.isActive) {
    throw new AppError('Account is not activated', 403);
  }

  return user.id;
};

export const generateResetToken = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return;
  }

  const resetToken = uuidv4();
  const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 година

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetTokenExpires: resetTokenExpires,
    },
  });

  await sendPasswordResetEmail(user.email, resetToken);
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetTokenExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired token', 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
    },
  });
};

export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { name, currentPassword, newPassword, newEmail } = data;

  let updated = false;
  let emailChanged = false;
  const updateData: any = {};

  if (name && name !== user.name) {
    updateData.name = name;
    updated = true;
  }

  if (newPassword) {
    if (!currentPassword) {
      throw new AppError(
        'Current password is required to change password',
        400,
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    updateData.passwordHash = newHash;
    updated = true;
  }

  if (newEmail && newEmail !== user.email) {
    const activationToken = uuidv4();
    updateData.email = newEmail.toLowerCase();
    updateData.isActive = false;
    updateData.activationToken = activationToken;
    emailChanged = true;
    updated = true;

    await sendEmailChangeConfirmation(user.email, newEmail, activationToken);
  }

  if (!updated) {
    return { updated: false, emailChanged: false };
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return { updated: true, emailChanged };
}
