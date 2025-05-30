import nodemailer from 'nodemailer';
import { sendEmail } from '../services/mailService';

export const sendActivationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const activationLink = `${process.env.CLIENT_URL}/auth/activate/${token}`;

  await sendEmail(
    transporter,
    to,
    'Activate your account',
    activationLink,
    'Activate your account',
  );
};

export const sendPasswordResetEmail = async (
  to: string,
  token: string,
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetLink = `${process.env.CLIENT_URL}/auth/reset-password/${token}`;

  await sendEmail(
    transporter,
    to,
    'Reset your password',
    resetLink,
    'Reset your password',
  );
};

export const sendEmailChangeConfirmation = async (
  oldEmail: string,
  newEmail: string,
  token: string,
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const confirmationLink = `${process.env.CLIENT_URL}/auth/confirm-email/${token}`;

  await sendEmail(
    transporter,
    oldEmail,
    'Confirm your email change',
    confirmationLink,
    'Confirm your email change',
  );

  await sendEmail(
    transporter,
    newEmail,
    'Confirm your new email',
    confirmationLink,
    'Confirm your new email',
  );
};
