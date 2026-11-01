import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = ({ to, subject, text, html }) => {
  return transporter.sendMail({
    to,
    subject,
    text,
    html,
  });
};

export const sendActivationEmail = (to, token) => {
  const link = `${process.env.BACK_URL}/auth/activate/${token}`;

  return sendEmail({
    to,
    subject: 'Activate your account',
    text: `Follow the link to activate your account: ${link}`,
    html: `<a href="${link}">Activate your account</a>`,
  });
};

export const sendResetEmail = (to, token) => {
  const link = `${process.env.FRONT_URL}/reset/${token}`;

  return sendEmail({
    to,
    subject: 'Reset password',
    text: `Follow the link to reset your password: ${link}`,
    html: `<a href="${link}">Reset password</a>`,
  });
};
