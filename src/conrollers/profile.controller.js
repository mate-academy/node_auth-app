import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@example.com',
    pass: 'your-email-password',
  },
});

async function viewProfile(req, res) {
  const { userId } = req.user;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      isEmailVerified: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json(user);
}

async function changePassword(req, res) {
  const { userId } = req.user;
  const { oldPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isValidPassword = await compare(oldPassword, user.password_hash);

  if (!isValidPassword) {
    return res.status(400).json({ error: 'Incorrect old password' });
  }

  const hashedNewPassword = await hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password_hash: hashedNewPassword,
      updated_at: new Date(),
    },
  });

  return res.status(200).json({ message: 'Password changed successfully' });
}

async function updateProfile(req, res) {
  const { userId } = req.user;
  const { email } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        isEmailVerified: false, // Сбрасываем верификацию при изменении email
        updated_at: new Date(),
      },
      select: { email: true, isEmailVerified: true },
    });

    return res
      .status(200)
      .json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

async function changeEmail(req, res) {
  const { userId } = req.user;
  const { password, newEmail } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isValidPassword = await compare(password, user.password_hash);

  if (!isValidPassword) {
    return res.status(400).json({ error: 'Incorrect password' });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      email: newEmail,
      isEmailVerified: false,
      updated_at: new Date(),
    },
  });

  await transporter.sendMail({
    from: '"Example App" <no-reply@example.com>',
    to: user.email,
    subject: 'Email Change Notification',
    html: `<p>Your email has been changed to: ${newEmail}</p>`,
  });

  return res.status(200).json({ message: 'Email changed successfully' });
}

export const profileController = {
  viewProfile,
  changePassword,
  changeEmail,
  updateProfile,
};
