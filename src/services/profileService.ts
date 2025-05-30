import bcrypt from 'bcrypt';
import prisma from '../prismaClient';
import { sendEmail } from './mailService';
import nodemailer from 'nodemailer';
import { AppError } from '../utils/AppError';

interface UpdateUserProfileOptions {
  userId: string;
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  newEmail?: string;
}

export const updateUserProfile = async ({
  userId,
  name,
  currentPassword,
  newPassword,
  newEmail,
}: {
  userId: string;
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  newEmail?: string;
}): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new AppError('User not found', 404);

  const dataToUpdate: Record<string, any> = {};

  if (name && name !== user.name) {
    dataToUpdate.name = name;
  }

  if (newPassword) {
    if (!currentPassword) {
      throw new AppError('Current password is required to change password', 400);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    dataToUpdate.passwordHash = hashedPassword;
  }

  if (newEmail && newEmail !== user.email) {
    const newToken = crypto.randomUUID();

    dataToUpdate.email = newEmail;
    dataToUpdate.isActive = false;
    dataToUpdate.activationToken = newToken;

    await sendEmail(
      nodemailer.createTransport({ /*...*/ }),
      newEmail,
      'Confirm your new email',
      `${process.env.CLIENT_URL}/auth/activate/${newToken}`,
      'Confirm your new email'
    );

    await sendEmail(
      nodemailer.createTransport({ /*...*/ }),
      user.email,
      'Your email was changed',
      `${process.env.CLIENT_URL}/auth/login`,
      'You changed your email'
    );
  }

  if (Object.keys(dataToUpdate).length === 0) {
    throw new AppError('No changes provided', 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
  });
};

